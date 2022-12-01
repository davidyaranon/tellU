import { memo, useEffect, useRef, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import DeleteIcon from "@mui/icons-material/Delete";
import auth,
{
  addCommentNew, downVoteComment, getLikes,
  getOnePost, loadCommentsNew, loadCommentsNewNextBatch,
  removeCommentNew, removePost, sendReportStatus, uploadImage, upVoteComment
} from '../fbconfig';
import { upVote, downVote, promiseTimeout } from "../fbconfig";
import { useToast } from "@agney/ir-toast";
import RoomIcon from '@mui/icons-material/Room';
import {
  IonAvatar, IonBackButton, IonButton, IonButtons, IonCard,
  IonCardContent, IonCol, IonContent, IonFab,
  IonFabButton, IonIcon,
  IonImg, IonInfiniteScroll, IonInfiniteScrollContent,
  IonItem, IonLabel, IonList, IonLoading, IonModal,
  IonNote, IonPage, IonRow, IonSkeletonText,
  IonSpinner, IonText, IonTextarea,
  IonTitle, IonToolbar
} from "@ionic/react";
import FadeIn from "react-fade-in";
import { v4 as uuidv4 } from "uuid";
import TimeAgo from "javascript-time-ago";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  cameraOutline, shareOutline, chevronBackOutline,
  alertCircleOutline, warningSharp, arrowUpOutline, banOutline
} from "ionicons/icons";
import { getColor, timeout } from '../shared/functions';
import { Keyboard, KeyboardResize, KeyboardResizeOptions } from "@capacitor/keyboard";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import Linkify from 'linkify-react';
import { Share } from "@capacitor/share";
import { Dialog } from '@capacitor/dialog';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  PhotoViewer as CapacitorPhotoViewer,
  Image as CapacitorImage
} from '@capacitor-community/photoviewer';
import ProfilePhoto from "./ProfilePhoto";
import { getDatabase, ref, onValue, goOffline, goOnline } from "firebase/database";
import PostImages from "./PostImages";
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import mentionInputStyles from "../mentionInputStyles";
import mentionInputStylesLight from "../mentionInputStylesLight";
import { useTabsContext } from "../my-context";
import "../App.css";

interface MatchUserPostParams {
  key: string;
}

const resizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.None,
}

const defaultResizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.Body,
}

const Post = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  console.log("post");
  const postKey = match.params.key;
  const [user] = useAuthState(auth);
  const Toast = useToast();
  const history = useHistory();
  const context = useTabsContext();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const sensitiveToggled = useSelector((state: any) => state.sensitive.sensitiveContent);
  const schoolName = useSelector((state: any) => state.user.school);
  const timeAgo = new TimeAgo("en-US");
  const db = getDatabase();
  const connectedRef = ref(db, ".info/connected");

  const [post, setPost] = useState<any | null>(null);
  const [commentUsers, setCommentUsers] = useState<SuggestionDataItem[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState<string>("");
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [disabledLikeButtonsComments, setDisabledLikeButtonsComments] = useState<number>(-1);
  const [likeAnimationComments, setLikeAnimationComments] = useState<number>(-1);
  const [dislikeAnimationComments, setDislikeAnimationComments] = useState<number>(-1);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState<string>("");
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [blob, setBlob] = useState<any | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [kbHeight, setKbHeight] = useState<number>(0);
  const [previousCommentLoading, setPreviousCommentLoading] = useState<boolean>(false);
  const [deleted, setDeleted] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportMessage, setReportMessage] = useState<string>("");
  const [notificationsToken, setNotificationsToken] = useState<string>("");
  const [deletingComment, setDeletingComment] = useState<boolean>(false);


  const reportPost = async () => {
    const { value } = await Dialog.confirm({
      title: 'Report Post',
      message: `Are you sure you want to report this post?`,
      okButtonTitle: 'Report'
    });
    if (value) {
      setShowReportModal(true);
    }
  }

  async function sendImage(blob: any, uniqueId: string) {
    const res = await uploadImage("commentImages", blob, uniqueId);
    if (res == false || photo == null || photo?.webPath == null) {
      Toast.error("unable to select photo");
    } else {
      // Toast.success("photo uploaded successfully");
    }
  }

  const sharePost = async () => {
    if (post && postKey) {
      await Share.share({
        title: post.userName + "'s Post",
        text: 'Let me tellU about this post I saw. \n\n' + "\"" + post.message + '\"\n\n',
        url: 'http://tellUapp.com/post/' + postKey, // url is currently not active
      });
    }
  }

  const handleCommentSubmit = async () => {
    if (comment.trim().length == 0 && photo === null) {
      Toast.error("Input a comment");
      Keyboard.hide();
    } else {
      setPhoto(null);
      //[tellU🎓](0tellU🎓)
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
      // setCommentsLoading(true);
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
          Toast.success("Comment added");
          if (comments) {
            commentSent.likes = { "null": true };
            commentSent.dislikes = { "null": true };
            const newCommentsArr: any[] = [...comments, commentSent];
            setComments(newCommentsArr);
          }
        } else {
          Toast.error("Unable to comment on post");
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

  const getPost = () => {
    if (postKey && schoolName) {
      const onePost = promiseTimeout(7500, getOnePost(postKey, schoolName));
      onePost.then(async (res) => {
        if (res) {
          onValue(connectedRef, (snap) => {
            if (snap.val() !== true) {
              goOffline(db);
              goOnline(db);
              setDisabledLikeButtons(-1);
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
          Toast.error("Post has been deleted");
          setPost(null);
          setDeleted(true);
        }
      });
      onePost.catch((err) => {
        Toast.error("Something went wrong");
      });
    } else {
      Toast.error("Unable to load post");
    }
  };

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

  const getDate = (timestamp: any) => {
    if (!timestamp) {
      return '';
    }
    if (timestamp && "nanoseconds" in timestamp && "seconds" in timestamp) {
      const time = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      );
      return timeAgo.format(time);
    }
    return "just now";
  };


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
        Toast.error("Something went wrong");
        setCommentsLoading(false);
      })
    }
  };

  const deleteComment = async (index: number, commentUrl: string) => {
    const { value } = await Dialog.confirm({
      title: 'Delete Comment',
      message: `Are you sure you'd like to delete your comment?`,
      okButtonTitle: 'Delete'
    });
    if (!value) { return; }
    // setCommentsLoading(true);
    if (comments && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(5000, removeCommentNew(commentBeingDeleted, schoolName, postKey, commentUrl));
      didDelete.then((res) => {
        if (res) {
          Toast.success("Comment deleted");
          if (comments.length == 0) {
            setComments([]);
            // setListOfUsers([]);
            // setListOfUsersMap(new Map<string, string[]>());
          } else {
            let tempComments: any[] = [];
            for (let i = 0; i < comments.length; ++i) {
              if (i !== index) {
                tempComments.push(comments[i]);
              }
            }
            const tempUsernameList: string[] = [];
            for (let i = 0; i < tempComments.length; ++i) {
              tempUsernameList.push(tempComments[i].userName);
            }
            setComments(tempComments);
            console.log(tempComments);
          }
          setCommentsLoading(false);
        } else {
          Toast.error("Unable to delete comment");
          setCommentsLoading(false);
        }
      });
      didDelete.catch((err) => {
        Toast.error(err);
        setCommentsLoading(false);
      })
    } else {
      Toast.error("Unable to delete comment");
      setCommentsLoading(false);
    }
  };

  const handleUserPageNavigation = (uid: string) => {
    history.push("/about/" + uid);
  };

  const handleUpVoteComment = async (commentKey: string, index: number) => {
    const val = await upVoteComment(commentKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (post && user) {
        let tempComments: any[] = [...comments];
        if (tempComments[index].likes[user.uid]) {
          delete tempComments[index].likes[user.uid];
        } else {
          if (tempComments[index].dislikes[user.uid]) {
            delete tempComments[index].dislikes[user.uid];
          }
          tempComments[index].likes[user.uid] = true;
        }
        setComments(tempComments);
        await timeout(100).then(() => {
          setDisabledLikeButtonsComments(-1);
        });
      }
    } else {
      Toast.error("Unable to like comment");
    }
  };

  const handleDownVoteComment = async (commentKey: string, index: number) => {
    const val = await downVoteComment(commentKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (post && user) {
        let tempComments: any[] = [...comments];
        tempComments[index].downVotes += val;
        if (tempComments[index].dislikes[user.uid]) {
          delete tempComments[index].dislikes[user.uid];
        } else {
          if (tempComments[index].likes[user.uid]) {
            delete tempComments[index].likes[user.uid];
          }
          tempComments[index].dislikes[user.uid] = true;
        }
        setComments(tempComments);
        await timeout(100).then(() => {
          setDisabledLikeButtonsComments(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike comment");
    }
  };

  const handleUpVote = async (post: any) => {
    const val = await upVote(postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (post && user) {
        let tempPost = post;
        if (tempPost.likes[user.uid]) {
          delete tempPost.likes[user.uid];
        } else {
          if (tempPost.dislikes[user.uid]) {
            delete tempPost.dislikes[user.uid];
          }
          tempPost.likes[user.uid] = true;
        }
        setPost(tempPost);
        await timeout(100).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to like post :(");
    }
  };

  const handleDownVote = async (post: any) => {
    const val = await downVote(postKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (post && user) {
        let tempPost = post;
        if (tempPost.dislikes[user.uid]) {
          delete tempPost.dislikes[user.uid];
        } else {
          if (tempPost.likes[user.uid]) {
            delete tempPost.likes[user.uid];
          }
          tempPost.dislikes[user.uid] = true;
        }
        setPost(tempPost);
        await timeout(100).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
  };

  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      });
      // console.log(image);
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if (blobRes) {
        if (blobRes.size > 5_000_000) {
          // 5MB
          Toast.error("Image too large");
        } else {
          setBlob(blobRes);
          setPhoto(image);
        }
      }
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  }

  const changeTaggedString = (id: string | number, display: string) => {
    return "@" + display;
  }

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
    <IonPage className="ion-page-ios-notch">
      <IonContent ref={contentRef} scrollEvents>

        <IonLoading isOpen={deletingComment} duration={0} message={"Deleting post..."} />

        <IonModal isOpen={showReportModal} mode="ios" swipeToClose={false} handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
          {/* <IonHeader translucent> */}
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios">
              <IonButtons slot="start">
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  onClick={() => {
                    setShowReportModal(false);
                  }}
                >
                  Cancel
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  slot="end"
                  onClick={() => {
                    if (reportMessage.length <= 0) {
                      Toast.error("Provide a reason why!");
                    } else {
                      setReportMessage("");
                      sendReportStatus(reportMessage, schoolName, postKey).then((reportStatus) => {
                        if (reportStatus) {
                          setShowReportModal(false);
                          Toast.success("Post reported");
                        } else {
                          Toast.error("Something went wrong");
                        }
                      });
                    }
                  }}
                >
                  Report
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </div>
          {/* </IonHeader> */}

          <IonContent>
            <IonCard mode="ios">
              <IonTextarea
                style={{ marginLeft: "2.5%" }}
                rows={4}
                mode="ios"
                value={reportMessage}
                maxlength={500}
                placeholder="Reason for reporting..."
                id="message"
                required={true}
                onIonChange={(e: any) => {
                  let currMessage = e.detail.value;
                  setReportMessage(currMessage);
                }}
              ></IonTextarea>
            </IonCard>
            <IonNote style={{
              textAlign: "center", alignItems: "center",
              alignSelf: "center", display: "flex", fontSize: "1em"
            }}>Post will be manually reviewed and might be deleted if deemed inappropriate</IonNote>
          </IonContent>
        </IonModal>

        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios">
            {post && post.userName &&
              <IonTitle>{post.userName}'s Post</IonTitle>
            }
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonBackButton
                style={{ marginLeft: "2.5%", scale: "0.95" }}
                color={
                  schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"
                }
                defaultHref="/home"
                icon={chevronBackOutline}
              />
            </IonButtons>
            <IonButtons slot='end'>
              <IonButton color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} slot="end" onClick={() => { reportPost(); }}>
                <IonIcon icon={alertCircleOutline} />
              </IonButton>
              <IonButton color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} disabled slot="end" onClick={() => { sharePost(); }}> {/* CHANGE DISABLED VALUE ONCE SHARE LINK IS ACTIVE */}
                <IonIcon icon={shareOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>

        <IonFab style={darkModeToggled ? { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" }
          : { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed"
          className={darkModeToggled ? "text-area-dark" : "text-area-light"} vertical="bottom" edge>
          <IonFab horizontal="end" vertical="top">
            <IonRow>
              <IonCol>
                {photo !== null && photo !== undefined ? (
                  <IonImg className="ion-img-comment" src={photo?.webPath} />
                ) : null}
              </IonCol>
              <IonFabButton disabled={deleted || previousCommentLoading || !post || comment.length === 0} size="small" color={schoolColorToggled ? "tertiary" : "primary"} onClick={() => { handleCommentSubmit(); }}>
                <IonIcon icon={arrowUpOutline} color={!darkModeToggled ? "light" : ""} size="small" mode="ios" />
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
          {darkModeToggled ?
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
                style={schoolColorToggled ? { backgroundColor: "#00856A" } : { backgroundColor: "#61dbfb" }}
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
                style={schoolColorToggled ? { backgroundColor: "#00856A" } : { backgroundColor: "#61dbfb" }}
                trigger='@'
                displayTransform={changeTaggedString}
                markup="@[__display__]"
                data={commentUsers} />
            </MentionsInput>
          }
        </IonFab>

        <div className="ion-modal">
          {post ? (
            <>
              <FadeIn>
                <div>
                  <IonList inset={true}>
                    <IonItem lines="none">
                      <IonLabel class="ion-text-wrap">
                        <IonText color="medium">
                          <FadeIn>
                            <div>
                              <IonAvatar
                                onClick={() => {
                                  setComment("");
                                  handleUserPageNavigation(
                                    post.uid
                                  );
                                }}
                                class="posts-avatar"
                              >
                                <ProfilePhoto uid={post.uid}></ProfilePhoto>
                              </IonAvatar>
                            </div>
                          </FadeIn>
                          <p>
                            {post.userName}
                          </p>
                        </IonText>
                        {post.postType ? (
                          <IonFab vertical="top" horizontal="end" onClick={(e) => {
                            if (post.postType !== "general") {
                              e.stopPropagation();
                              history.push("type/" + post.postType);
                            }
                          }}>
                            {post.postType !== "general" ?
                              <p
                                style={{
                                  fontWeight: "bold",
                                  color: getColor(post.postType),
                                }}
                              >
                                {post.postType.toUpperCase()}
                                &nbsp;
                                {post.marker ? (
                                  <RoomIcon
                                    style={{ fontSize: "1em" }}
                                    onClick={() => {
                                      localStorage.setItem("lat", (post.location[0].toString()));
                                      localStorage.setItem("long", (post.location[1].toString()));
                                      history.push("/maps");
                                    }}
                                  />
                                ) : null}
                              </p>
                              :
                              <p
                                style={{
                                  fontWeight: "bold",
                                  color: getColor(post.postType),
                                  marginLeft: "75%"
                                }}
                              >
                                {post.marker ? (
                                  <RoomIcon onClick={() => {
                                    localStorage.setItem("lat", (post.location[0].toString()));
                                    localStorage.setItem("long", (post.location[1].toString()));
                                    history.push("/maps");
                                  }}
                                    style={{ fontSize: "1em" }} />) : null}
                              </p>
                            }
                            <IonNote style={{ fontSize: "0.85em" }}>
                              {getDate(post.timestamp)}
                            </IonNote>
                          </IonFab>
                        ) :
                          (
                            <IonFab vertical="top" horizontal="end">
                              <IonNote style={{ fontSize: "0.85em" }}>
                                {getDate(post.timestamp)}
                              </IonNote>
                            </IonFab>
                          )}
                        <div style={{ height: "0.75vh" }}>{" "}</div>
                        {"className" in post && "classNumber" in post && post.className.length > 0 ?
                          <Linkify style={sensitiveToggled && "reports" in post && post.reports > 1 ? { filter: "blur(0.25em)" } : {}} tagName="h3" className="h2-message">
                            {post.message} <IonNote onClick={(e) => {
                              e.stopPropagation();
                              history.push("/class/" + post.className);
                            }} color="medium" style={{ fontWeight: "400" }}> &nbsp; — {post.className}{post.classNumber}</IonNote>
                          </Linkify>
                          :
                          <Linkify style={sensitiveToggled && "reports" in post && post.reports > 1 ? { filter: "blur(0.25em)" } : {}} tagName="h3" className="h2-message">
                            {post.message}
                          </Linkify>
                        }

                        <PostImages isSensitive={sensitiveToggled} post={post} />

                      </IonLabel>
                      <div
                        id={post.postType.replace("/", "")}
                      ></div>
                    </IonItem>

                    <IonItem lines="none" mode="ios">
                      <IonButton
                        onAnimationEnd={() => {
                          setLikeAnimation(-1);
                        }}
                        className={likeAnimation === 0 ? "likeAnimation" : ""}
                        disabled={
                          disabledLikeButtons === 0 || Object.keys(post.likes).length - 1 === -1
                        }
                        mode="ios"
                        fill="outline"
                        color={
                          post &&
                            user &&
                            "likes" in post &&
                            post.likes[user.uid] !== undefined
                            && schoolName !== "Cal Poly Humboldt"
                            ? "primary"
                            :
                            post &&
                              user &&
                              "likes" in post &&
                              post.likes[user.uid] !== undefined
                              && schoolName === "Cal Poly Humboldt" && schoolColorToggled
                              ? "tertiary"
                              :
                              post &&
                                user &&
                                "likes" in post &&
                                post.likes[user.uid] !== undefined
                                && schoolName === "Cal Poly Humboldt" && !schoolColorToggled
                                ? "primary"
                                : "medium"
                        }
                        onClick={() => {
                          setLikeAnimation(0);
                          setDisabledLikeButtons(0);
                          handleUpVote(post);
                        }}
                      >
                        <KeyboardArrowUpIcon />
                        <p>{Object.keys(post.likes).length - 1} </p>
                      </IonButton>
                      <p>&nbsp;</p>
                      <IonButton
                        onAnimationEnd={() => {
                          setDislikeAnimation(-1);
                        }}
                        className={
                          dislikeAnimation === 0
                            ? "likeAnimation"
                            : ""
                        }
                        disabled={
                          disabledLikeButtons === 0 || Object.keys(post.dislikes).length - 1 === -1
                        }
                        mode="ios"
                        fill="outline"
                        color={
                          post &&
                            user &&
                            "dislikes" in post &&
                            post.dislikes[
                            user.uid
                            ] !== undefined
                            ? "danger"
                            : "medium"
                        }
                        onClick={() => {
                          setDislikeAnimation(0);
                          setDisabledLikeButtons(0);
                          handleDownVote(post);
                        }}
                      >
                        <KeyboardArrowDownIcon />
                        <p>{Object.keys(post.dislikes).length - 1} </p>
                      </IonButton>
                      {"reports" in post && post.reports > 1 && user && user.uid !== post.uid &&
                        <IonFab horizontal="end">
                          <IonIcon icon={warningSharp} color="warning" onClick={() => {
                            Dialog.alert({
                              title: "Flagged Post",
                              message: 'Post has been reported as sensitive/objectionable'
                            })
                          }}></IonIcon>
                        </IonFab>
                      }

                      {user && user.uid === post.uid && "reports" in post && post.reports > 1 ? (
                        <IonFab horizontal="end">
                          <IonButton
                            mode="ios"
                            fill="outline"
                            color="danger"
                            onClick={() => { }}
                          >
                            <DeleteIcon />
                          </IonButton>
                          {" "}
                          <IonButton mode="ios" fill="clear" onClick={() => {
                            Dialog.alert({
                              title: "Flagged Post",
                              message: 'Post has been reported as sensitive/objectionable'
                            })
                          }}>
                            <IonIcon icon={warningSharp} color="warning" style={{ padding: "-10vh" }}></IonIcon>
                          </IonButton>
                        </IonFab>
                      ) : user && user.uid === post.uid && "reports" in post && post.reports < 2 ?
                        (
                          <IonFab horizontal="end">
                            <IonButton
                              mode="ios"
                              fill="outline"
                              color="danger"
                              onClick={async () => {
                                const { value } = await Dialog.confirm({
                                  title: 'Delete Post',
                                  message: `Are you sure you'd like to delete your post?`,
                                  okButtonTitle: 'Delete'
                                });
                                if (!value) { return; }
                                if ("url" in post && post.url && post.url.length > 0) {
                                  console.log("deleting post with images");
                                  if (!schoolName) {
                                    Toast.error("Something went wrong, try again");
                                  }
                                  setDeletingComment(true);
                                  const didDelete = await removePost(postKey, schoolName, post.url);
                                  if (didDelete !== undefined) {
                                    Toast.success("Deleted post");
                                  } else {
                                    Toast.error("Something went wrong when deleting post, try again")
                                  }
                                  history.push("/about/" + post.uid);
                                  setDeletingComment(false);
                                } else {
                                  console.log("deleting post without images");
                                  if (!schoolName) {
                                    Toast.error("Something went wrong, try again");
                                  }
                                  setDeletingComment(true);
                                  const didDelete = await removePost(postKey, schoolName, []);
                                  if (didDelete !== undefined) {
                                    Toast.success("Deleted post");
                                  } else {
                                    Toast.error("Something went wrong when deleting post, try again")
                                  }
                                  history.push("/about/" + post.uid);
                                  setDeletingComment(false);
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IonButton>
                          </IonFab>
                        ) : null}
                    </IonItem>
                  </IonList>
                </div>
              </FadeIn>

              <div className="verticalLine"></div>
            </>
          ) :
            <>
              <FadeIn>
                <IonCard mode="ios" style={{ height: "20vh" }}>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size="2">
                        <IonSkeletonText style={{ height: "5vh", marginLeft: "-1vw" }} animated></IonSkeletonText>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonSkeletonText style={{ height: "2vh" }} animated></IonSkeletonText>
                      <IonSkeletonText style={{ height: "2vh" }} animated></IonSkeletonText>
                    </IonRow>
                  </IonCardContent>
                </IonCard>
              </FadeIn>
            </>
          }

          {commentsLoading || !comments ? (
            <div
              style={{
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <IonSpinner color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} />
            </div>
          ) : (
            <FadeIn>
              {comments && comments.length > 0 &&
                <IonNote style={{ display: "flex", justifyContent: "center" }} >Comments</IonNote>
              }
              {comments && comments.length > 0
                ? comments?.map((comment: any, index: number) => (
                  <IonList inset={true} key={index}>
                    {" "}
                    <IonItem mode="ios" lines="none">
                      <IonLabel class="ion-text-wrap">
                        <IonText color="medium">
                          <p>
                            <IonAvatar
                              onClick={() => {
                                setComment("");
                                handleUserPageNavigation(comment.uid);
                              }}
                              class="posts-avatar"
                            >
                              <ProfilePhoto uid={comment.uid}></ProfilePhoto>
                            </IonAvatar>
                            {comment.userName}
                          </p>
                        </IonText>
                        <Linkify tagName="h3" className="h2-message">
                          {comment.comment}
                        </Linkify>
                        {"imgSrc" in comment && comment.imgSrc && comment.imgSrc.length > 0 ? (
                          <>
                            <br></br>
                            <div
                              className="ion-img-container"
                              style={{ backgroundImage: `url(${comment.imgSrc})`, borderRadius: '10px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const img: CapacitorImage = {
                                  url: comment.imgSrc,
                                  title: `${comment.userName}'s comment`
                                };
                                CapacitorPhotoViewer.show({
                                  options: {
                                    title: true
                                  },
                                  images: [img],
                                  mode: 'one',
                                }).catch((err) => {
                                  Toast.error('Unable to open image on web version');
                                });
                              }}
                            >
                            </div>
                          </>
                        ) : null}
                      </IonLabel>
                      {"timestamp" in comment ? (
                        <IonFab vertical="top" horizontal="end">
                          <IonNote style={{ fontSize: "0.75em" }}>
                            {getDate(comment.timestamp)}
                          </IonNote>
                        </IonFab>
                      ) : null}
                      <div></div>
                    </IonItem>
                    <IonItem lines="none" mode="ios">
                      <IonButton
                        onAnimationEnd={() => {
                          setLikeAnimationComments(-1);
                        }}
                        className={
                          likeAnimationComments === comment.key ? "likeAnimation" : ""
                        }
                        disabled={disabledLikeButtonsComments === index || deleted || (Object.keys(comment.likes).length - 1) === -1}
                        mode="ios"
                        fill="outline"
                        color={
                          comment &&
                            user &&
                            "likes" in comment &&
                            comment.likes[user.uid] !==
                            undefined &&
                            schoolName === "Cal Poly Humboldt" && schoolColorToggled ?
                            "tertiary"
                            : comment &&
                              user &&
                              "likes" in comment &&
                              comment.likes[user.uid] !==
                              undefined &&
                              schoolName === "Cal Poly Humboldt" && !schoolColorToggled ?
                              "primary"
                              : "medium"
                        }
                        onClick={() => {
                          setLikeAnimationComments(comment.key);
                          setDisabledLikeButtonsComments(index);
                          handleUpVoteComment(comment.key, index);
                        }}
                      >
                        <KeyboardArrowUpIcon />
                        <p>{Object.keys(comment.likes).length - 1} </p>
                      </IonButton>
                      <IonButton
                        mode="ios"
                        fill="outline"
                        disabled={
                          disabledLikeButtonsComments === index || deleted || Object.keys(comment.dislikes).length - 1 === -1
                        }
                        onAnimationEnd={() => {
                          setDislikeAnimationComments(-1);
                        }}
                        className={
                          dislikeAnimationComments === comment.key ? "likeAnimation" : ""
                        }
                        color={
                          comment &&
                            user &&
                            "dislikes" in comment &&
                            comment.dislikes[user.uid] !==
                            undefined
                            ? "danger"
                            : "medium"
                        }
                        onClick={() => {
                          setDislikeAnimationComments(comment.key);
                          setDisabledLikeButtonsComments(index);
                          handleDownVoteComment(comment.key, index);
                        }}
                      >
                        <KeyboardArrowDownIcon />
                        <p>{Object.keys(comment.dislikes).length - 1} </p>
                      </IonButton>
                      {user && user.uid === comment.uid ? (
                        <IonFab horizontal="end">
                          <IonButton
                            mode="ios"
                            fill="outline"
                            color="danger"
                            onClick={() => { deleteComment(index, comment.url); }}
                          >
                            <DeleteIcon />
                          </IonButton>
                        </IonFab>
                      ) : null}
                    </IonItem>
                  </IonList>
                ))
                : null}
            </FadeIn>
          )}
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