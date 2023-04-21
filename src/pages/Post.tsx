/* React + Ionic/Capacitor */
import React from "react";
import {
  IonCol, IonContent, IonFab,
  IonFabButton, IonIcon, IonImg, IonInfiniteScroll,
  IonInfiniteScrollContent, IonLoading, IonNote, IonPage, IonRow
} from "@ionic/react";
import { memo, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { RouteComponentProps } from "react-router-dom";
import { Keyboard, KeyboardResize, KeyboardResizeOptions } from "@capacitor/keyboard";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { arrowUpOutline, banOutline, cameraOutline } from "ionicons/icons";

/* CSS */
import "../App.css";

/* Firebase */
import auth, {
  addCommentNew, getLikes, promiseTimeout, getOnePost,
  loadCommentsNew, loadCommentsNewNextBatch, uploadImage
} from '../fbConfig';
import { getDatabase, ref, onValue, goOffline, goOnline } from "firebase/database";

/* Other Compontents */
// import FadeIn from "react-fade-in";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@agney/ir-toast";
import { useContext } from "../my-context";
import mentionInputStyles from "../helpers/mentionInputStyles";
import mentionInputStylesLight from "../helpers/mentionInputStylesLight";
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { Toolbar } from "../components/Shared/Toolbar";
import PostPagePost from "../components/PostPage/PostPagePost";
import { CommentLoading, PostLoading } from "../components/PostPage/PostLoading";
import { ReportModal } from "../components/PostPage/ReportModal";
import { PostComment } from "../components/PostPage/Comment";

interface MatchUserPostParams {
  school: string;
  userName: string;
  key: string;
}

const resizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.None,
}

const defaultResizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.Body,
}

const Post = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const postKey = match.params.key;
  const schoolName = match.params.school;
  const userName = match.params.userName;

  /* Hooks */
  const [user] = useAuthState(auth);
  const Toast = useToast();
  const context = useContext();
  const db = getDatabase();

  /* State Variables */
  const connectedRef = ref(db, ".info/connected");
  const [post, setPost] = useState<any | null>(null);
  const [commentUsers, setCommentUsers] = useState<SuggestionDataItem[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState<string>("");
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState<string>("");
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [blob, setBlob] = useState<any | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [kbHeight, setKbHeight] = useState<number>(0);
  const [previousCommentLoading, setPreviousCommentLoading] = useState<boolean>(false);
  const [deleted, setDeleted] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [notificationsToken, setNotificationsToken] = useState<string>("");
  const [deletingComment, setDeletingComment] = useState<boolean>(false);

  const handleSetComment = React.useCallback((com: string) => {
    setComment(com);
  }, []);

  const handleSetComments = React.useCallback((coms: any[]) => {
    setComments(coms);
  }, []);

  const handleSetCommentsLoading = React.useCallback((loading: boolean) => {
    setCommentsLoading(loading);
  }, []);

  const handleSetDeletingComment = React.useCallback((isDeleting: boolean) => {
    setDeletingComment(isDeleting);
  }, []);

  const handleShowReportModal = React.useCallback((show: boolean) => {
    setShowReportModal(show)
  }, [])

  /**
   * @description Sends an image to Firestore storage under /commentImages/{uuid}
   * 
   * @param blob the photo data
   * @param uniqueId the ID of the photo
   */
  async function sendImage(blob: any, uniqueId: string) {
    const res = await uploadImage("commentImages", blob, uniqueId);
    if (res == false || photo == null || photo?.webPath == null) {
      const toast = Toast.create({ message: 'Unable to select photo', duration: 2000, color: 'toast-error' });
      toast.present();
    } else {
      // Toast.success("photo uploaded successfully");
    }
  }

  /**
   * @description uploads a comment to Firestore under schoolPosts/{schoolName}/allPosts/{postKey}/comments
   * then sends a Toast confirming the comment was uploaded
   */
  const handleCommentSubmit = async () => {
    if (comment.trim().length == 0 && photo === null) {
      const toast = Toast.create({ message: 'Input a comment!', duration: 2000, color: 'toast-error' });
      toast.present();
      Keyboard.hide();
    } else {
      setPhoto(null);
      const tempComment2 = comment;
      const tempComment1 = tempComment2.replaceAll('[', '');
      const tempComment = tempComment1.replaceAll(']', '');
      console.log({ tempComment });
      console.log({ notificationsToken });
      let containsAt: boolean = false;
      let attedUser: string = "";
      let attedUsers = new Map();
      let attedUsersList: string[] = [];
      console.log(tempComment2);
      for (let i = 0; i < tempComment2.length; ++i) {
        if (tempComment2[i] === '@') {
          containsAt = true;
        }
        if (tempComment2[i] === '[' && containsAt) {
          let j = i + 1;
          while (tempComment2[j] !== ']') {
            attedUser += tempComment2[j++];
          }
          attedUsers.set(attedUser, 1);
          attedUser = "";
          containsAt = false;
        }
      }
      let commentUsernames: string[] = [];
      commentUsers.forEach((value, index) => {
        console.log(value.display);
        commentUsernames.push(value.display || "");
      })
      attedUsers.forEach((value: number, key: string) => {
        if (commentUsernames.includes(key)) {
          console.log("real @'d user: ", key);
          attedUsersList.push(key);
        }
      });
      setComment("");
      Keyboard.hide();
      setPreviousCommentLoading(true);
      let uniqueId = uuidv4();
      if (blob) {
        await sendImage(blob, uniqueId.toString());
        setBlob(null);
      }
      const hasTimedOut = promiseTimeout(
        10000,
        addCommentNew(postKey, schoolName, tempComment, blob, uniqueId.toString(), notificationsToken, post.uid, localStorage.getItem("notificationsToken") || "", attedUsersList)
      );
      hasTimedOut.then(async (commentSent: any) => {
        if (commentSent) {
          const toast = Toast.create({ message: 'Comment added', duration: 2000, color: 'toast-success' });
          toast.present();
          toast.dismiss();
          if (comments) {
            commentSent.likes = { "null": true };
            commentSent.dislikes = { "null": true };
            const newCommentsArr: any[] = [...comments, commentSent];
            setComments(newCommentsArr);
          }
        } else {
          const toast = Toast.create({ message: 'Unable to comment on post', duration: 2000, color: 'toast-error' });
          toast.present();
        }
        setCommentsLoading(false);
        setPreviousCommentLoading(false);
        contentRef && contentRef.current && contentRef.current.scrollToBottom(750);
      });
      hasTimedOut.catch((err) => {
        Toast.warning('Slow internet connection, comment will be uploaded soon...');
        setCommentsLoading(false);
        setPreviousCommentLoading(false);
      });
    }
  };

  /**
   * @description returns all post data from Firestore based on postKey
   */
  const getPost = () => {
    if (postKey && schoolName) {
      const onePost = promiseTimeout(7500, getOnePost(postKey, schoolName));
      onePost.then(async (res) => {
        if (res) {
          onValue(connectedRef, (snap) => {
            if (snap.val() !== true) {
              goOffline(db);
              goOnline(db);
            }
          });
          const data = await getLikes(postKey);
          console.log(data);
          if (data) {
            res.likes = data.likes;
            res.dislikes = data.dislikes;
          } else {
            res.likes = {};
            res.dislikes = {};
          }
          setPost(res);
          setNotificationsToken(res.notificationsToken);
        } else {
          const toast = Toast.create({ message: 'Post has been deleted', duration: 2000, color: 'toast-error' });
          toast.present();
          setPost(null);
          setDeleted(true);
        }
      });
      onePost.catch((err) => {
        const toast = Toast.create({ message: 'Something went wrong', duration: 2000, color: 'toast-error' });
        toast.present();
      });
    } else {
      const toast = Toast.create({ message: 'Unable to load post', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  };

  /**
   * @description loads the next 10 comments in line from Firestore
   * 
   * @param event IonInfiniteLoad event confirmation load has finished
   */
  const handleLoadCommentsNextBatch = async (event: any) => {
    console.log("inf")
    if (postKey && schoolName && lastKey) {
      const commentsLoaded = promiseTimeout(7500, loadCommentsNewNextBatch(postKey, schoolName, lastKey));
      commentsLoaded.then(async (res) => {
        if (res) {
          for (let i = 0; i < res.comments.length; ++i) {
            const data = await getLikes(res.comments[i].key);
            if (data) {
              res.comments[i].likes = data.likes;
              res.comments[i].dislikes = data.dislikes;
              res.comments[i].commentAmount = data.commentAmount;
            } else {
              res.comments[i].likes = {};
              res.comments[i].dislikes = {};
              res.comments[i].commentAmount = 0;
            }
          }
          const tempCommentsArr: any[] = comments?.concat(res.comments);
          setComments(tempCommentsArr);
          setLastKey(res.lastKey);
          event.target.complete();
        }
      });
      commentsLoaded.catch((err) => {
        Toast.error(err);
      })
    } else {
      Toast.error("");
      console.error("postKey / lastKey / schoolName unavaiable or undefined");
    }
  }

  /**
   * @description returns the 10 most recent comments on the post from Firestore
   */
  const getPostComments = () => {
    setCommentsLoading(true);
    if (postKey && schoolName) {
      const commentsLoaded = promiseTimeout(7500, loadCommentsNew(postKey, schoolName));
      commentsLoaded.then(async (res) => {
        if (res) {
          let repeatMap = new Map();
          for (let i = 0; i < res.comments.length; ++i) {
            let dataItem: SuggestionDataItem = {
              id: i.toString() + res.comments[i].userName,
              display: res.comments[i].userName
            }
            if (!repeatMap.get(res.comments[i].userName) && auth.currentUser?.displayName !== res.comments[i].userName) {
              console.log(dataItem);
              setCommentUsers(curr => [...curr, dataItem]);
            }
            repeatMap.set(res.comments[i].userName, 1);
            const data = await getLikes(res.comments[i].key);
            if (data) {
              res.comments[i].likes = data.likes;
              res.comments[i].dislikes = data.dislikes;
              res.comments[i].commentAmount = data.commentAmount;
            } else {
              res.comments[i].likes = {};
              res.comments[i].dislikes = {};
              res.comments[i].commentAmount = 0;
            }
          }
          setComments(res.comments);
          setLastKey(res.lastKey);
        }
        setCommentsLoading(false);
      });
      commentsLoaded.catch((err) => {
        const toast = Toast.create({ message: 'Something went wrong', duration: 2000, color: 'toast-error' });
        toast.present();
        setCommentsLoading(false);
      })
    }
  };

  /**
   * @description handles the logic of adding a photo to a comment
   * Users could either pic one photo from their gallery or take a photo
   * The photo and blob state variables are then assigned 
   */
  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      });
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if (blobRes) {
        if (blobRes.size > 5_000_000) {
          // 5MB
          const toast = Toast.create({ message: 'Image too large', duration: 2000, color: 'toast-error' });
          toast.present();
        } else {
          setBlob(blobRes);
          setPhoto(image);
        }
      }
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  }

  /**
   * @description changes the string of the user's comment if they tagged anyone using the @ symbol 
   * 
   * @param {string | number} id unused
   * @param {string} display the string of the user's comment
   * @returns a newly formatted string with a prepended @ symbol
   */
  const changeTaggedString = (id: string | number, display: string) => {
    return "@" + display;
  }

  // runs on page load
  useEffect(() => {
    setPost(null);
    setPreviousCommentLoading(false);
    setDeleted(false);
    context.setShowTabs(true);
    if (user && schoolName) {
      getPost();
      getPostComments();
      Keyboard.addListener('keyboardWillShow', info => {
        Keyboard.setResizeMode(resizeOptions);
        setKbHeight(info.keyboardHeight);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        Keyboard.setResizeMode(defaultResizeOptions);
        setKbHeight(0);
      });
      return () => {
        Keyboard.removeAllListeners();
      };
    } else {
      if (!user) {
        console.log("user not a thing");
      }
      if (!schoolName) {
        console.log("no school name");
      }
    }
  }, [user, schoolName, match.params.key]);


  //TO-DO: Replace comments with Virtuoso component
  return (
    <IonPage>
      <Toolbar setShowReportModal={handleShowReportModal} schoolName={schoolName} title={userName + '\'s Post'} text={"Back"} />
      <IonContent fullscreen ref={contentRef} scrollEvents>
        <IonLoading isOpen={deletingComment} duration={0} message={"Deleting post..."} />
        <ReportModal schoolName={schoolName} postKey={postKey} handleShowReportModal={handleShowReportModal} isOpen={showReportModal} />
        <IonFab style={context.darkMode ? { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" }
          : { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed"
          className={context.darkMode ? "text-area-dark" : "text-area-light"} vertical="bottom" edge>
          <IonFab horizontal="end" vertical="top">
            <IonRow>
              <IonCol>
                {photo !== null && photo !== undefined ? (
                  <IonImg className="ion-img-comment" src={photo?.webPath} />
                ) : null}
              </IonCol>
              <IonFabButton disabled={deleted || previousCommentLoading || !post || (comment.length === 0 && !photo)} size="small" color={context.schoolColorToggled ? "tertiary" : "primary"} onClick={() => { handleCommentSubmit(); }}>
                <IonIcon icon={arrowUpOutline} color={!context.darkMode ? "light" : ""} size="small" mode="ios" />
              </IonFabButton>
            </IonRow>
            <IonRow>
              <IonCol></IonCol>
              {!photo ?
                <IonFabButton disabled={deleted || previousCommentLoading || !post} size="small" color="medium" onClick={() => { takePicture(); }}>
                  <IonIcon icon={cameraOutline} size="small" />
                </IonFabButton>
                :
                <IonFabButton disabled={deleted || previousCommentLoading || !post} onClick={() => { setPhoto(null); setBlob(null) }} color="medium" size="small">
                  <IonIcon size="small" icon={banOutline} />
                </IonFabButton>
              }
            </IonRow>
          </IonFab>
          {context.darkMode ?
            <MentionsInput
              disabled={deleted || previousCommentLoading || !post}
              allowSuggestionsAboveCursor
              forceSuggestionsAboveCursor
              ignoreAccents
              style={mentionInputStyles}
              maxLength={250}
              value={comment}
              placeholder={previousCommentLoading || deleted || !post ? "Please wait..." : "Use @ to reply to a comment..."}
              onChange={(e) => {
                setComment(e.target.value);
              }}
            >
              <Mention
                style={context.schoolColorToggled ? { backgroundColor: "#00856A" } : { backgroundColor: "#61dbfb" }}
                trigger='@'
                displayTransform={changeTaggedString}
                markup="@[__display__]"
                data={commentUsers} />
            </MentionsInput>
            :
            <MentionsInput
              disabled={deleted || previousCommentLoading || !post}
              allowSuggestionsAboveCursor
              forceSuggestionsAboveCursor
              ignoreAccents
              style={mentionInputStylesLight}
              maxLength={250}
              value={comment}
              placeholder={previousCommentLoading || deleted || !post ? "Please wait..." : "Use @ to reply to a comment..."}
              onChange={(e) => {
                setComment(e.target.value);
              }}
            >
              <Mention
                style={context.schoolColorToggled ? { backgroundColor: "#00856A" } : { backgroundColor: "#61dbfb" }}
                trigger='@'
                displayTransform={changeTaggedString}
                markup="@[__display__]"
                data={commentUsers} />
            </MentionsInput>
          }
        </IonFab>

        <div>
          <>
            {post ?
              <>
                <PostPagePost handleSetDeletingComment={handleSetDeletingComment} schoolName={schoolName} user={user} index={0} post={post} postKey={postKey} />
              </>
              :
              <PostLoading />
            }

            {commentsLoading || !comments ? (
              <CommentLoading schoolName={schoolName} />
            ) : (
              <>
                {comments && comments.length > 0 && <IonNote style={{ display: "flex", justifyContent: "center" }}>Comments</IonNote>}
                {comments && comments.length > 0
                  ? comments?.map((comment: any, index: number) => (
                    <PostComment key={index} handleSetComments={handleSetComments} handleSetCommentsLoading={handleSetCommentsLoading} handleSetComment={handleSetComment}
                      post={post} user={user} postKey={postKey} comment={comment} comments={comments} schoolName={schoolName} index={index} deleted={deleted} />
                  ))
                  : null}
              </>
            )}
          </>
        </div>

        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />


        <IonInfiniteScroll
          onIonInfinite={(e: any) => { handleLoadCommentsNextBatch(e) }}
          disabled={(lastKey.length == 0) || (commentsLoading) || (comments && comments.length < 10)}
          position="bottom"
          threshold="10px"
        >
          <IonInfiniteScrollContent
            style={{ transform: "translateY(-25vh)" }}
            loadingSpinner="crescent"
            loadingText="Loading">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>

      </IonContent>
    </IonPage >
  )
}

export default memo(Post);