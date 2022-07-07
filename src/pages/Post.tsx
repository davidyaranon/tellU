import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import DeleteIcon from "@mui/icons-material/Delete";
import auth, { addCommentNew, downVoteComment, getLikes, getOnePost, loadCommentsNew, loadCommentsNewNextBatch, removeCommentNew, uploadImage, upVoteComment } from '../fbconfig';
import {
  upVote,
  downVote,
  promiseTimeout,
} from "../fbconfig";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import RoomIcon from '@mui/icons-material/Room';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRow,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
  RouterDirection,
  useIonRouter,
} from "@ionic/react";
import FadeIn from "react-fade-in";
import { v4 as uuidv4 } from "uuid";
// import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
// import { PhotoViewer, Image } from '@capacitor-community/photoviewer'; USE THIS WHEN IMPLEMENTING VIDEOS
import "../App.css";
import TimeAgo from "javascript-time-ago";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { cameraOutline, shareOutline, chevronBackOutline } from "ionicons/icons";
import { getColor, timeout } from '../components/functions';
import { Keyboard, KeyboardResize, KeyboardResizeOptions } from "@capacitor/keyboard";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import Linkify from 'linkify-react';
import { Share } from "@capacitor/share";
import { Dialog } from '@capacitor/dialog';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import ProfilePhoto from "./ProfilePhoto";

interface MatchUserPostParams {
  key: string;
}

const resizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.None,
}

const defaultResizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.Native,
}

// const pattern = /\B@[a-z0-9_-]+/gi; // used for tagged users

const Post = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const postKey = match.params.key;
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const timeAgo = new TimeAgo("en-US");
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState<string>("");
  const Toast = useToast();
  const history = useHistory();
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [disabledLikeButtonsComments, setDisabledLikeButtonsComments] = useState<number>(-1);
  const [likeAnimationComments, setLikeAnimationComments] = useState<number>(-1);
  const [dislikeAnimationComments, setDislikeAnimationComments] = useState<number>(-1);
  const [user] = useAuthState(auth);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState<string>("");
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [blob, setBlob] = useState<any | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [showPictureAddButton, setShowPictureAddButton] = useState<boolean>(true);
  const [kbHeight, setKbHeight] = useState<number>(0);
  const [previousCommentLoading, setPreviousCommentLoading] = useState<boolean>(false);
  const [deleted, setDeleted] = useState<boolean>(false);
  const router = useIonRouter();
  // const [showTags, setShowTags] = useState<boolean>(false);
  // const [listOfUsers, setListOfUsers] = useState<string[]>([]);
  // const [listOfUsersMap, setListOfUsersMap] = useState<Map<string, string[]>>(new Map<string, string[]>());
  // const [attedUser, setAttedUser] = useState<string>("all");
  // const [taggedUsers, setTaggedUsers] = useState<string[]>();

  const dynamicNavigate = (path : string, direction : RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }
  const navigateBack = () => {
    if (router.canGoBack()) {
      router.goBack();
    } else {
      Toast.error("something went wrong");
    }
  }

  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
    // setTaggedUsers(currComment.match(pattern));
  };

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
        url: 'http://tellUapp.com/post/' + postKey,
      });
    }
  }

  const handleCommentSubmit = async () => {
    if (comment.trim().length == 0 && photo === null) {
      Toast.error("Input a comment");
      Keyboard.hide();
    } else {
      setPhoto(null);
      const tempComment = comment;
      setComment("");
      Keyboard.hide();
      setCommentsLoading(true);
      setPreviousCommentLoading(true);
      let uniqueId = uuidv4();
      if (blob) {
        await sendImage(blob, uniqueId.toString());
        setBlob(null);
      }
      const hasTimedOut = promiseTimeout(
        10000,
        addCommentNew(postKey, schoolName, tempComment, blob, uniqueId.toString(),)
      );
      hasTimedOut.then(async (commentSent: any) => {
        if (commentSent) {
          Toast.success("Comment added");
          if (comments) {
            commentSent.likes = { "null": true };
            commentSent.dislikes = { "null": true };
            const newCommentsArr: any[] = [commentSent, ...comments];
            // const tempUsernameList: string[] = [];
            // const tempMap: Map<string, string[]> = new Map<string, string[]>();
            // for (let i = 0; i < newCommentsArr.length; ++i) {
            //   tempUsernameList.push(newCommentsArr[i].userName);
            //   if (tempMap.get(newCommentsArr[i].userName[0]) !== undefined) {
            //     const tempArr: string[] | undefined = tempMap.get(newCommentsArr[i].userName[0]);
            //     if (tempArr !== undefined) {
            //       tempArr.push(newCommentsArr[i].userName);
            //       tempMap.set(newCommentsArr[i].userName[0], tempArr);
            //     }
            //   } else {
            //     tempMap.set(newCommentsArr[i].userName[0], newCommentsArr[i].userName);
            //   }
            // }
            // tempMap.set("all", tempUsernameList);
            // setListOfUsersMap(tempMap);
            // setListOfUsers(tempUsernameList);
            setComments(newCommentsArr);
          }
        } else {
          Toast.error("Unable to comment on post");
        }
        setCommentsLoading(false);
        setPreviousCommentLoading(false);
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
          const data = await getLikes(postKey);
          if (data) {
            res.likes = data.likes;
            res.dislikes = data.dislikes;
          } else {
            res.likes = {};
            res.dislikes = {};
          }
          setPost(res);
        } else {
          Toast.error("Post has been deleted");
          setPost(null);
          setDeleted(true);
          setShowPictureAddButton(false);
        }
      });
      onePost.catch((err) => {
        Toast.error(err);
      });
    } else {
      Toast.error("Unable to load message rn");
    }
  };

  const handleLoadCommentsNextBatch = async (event: any) => {
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
          // const tempUsernameList: string[] = [];
          const tempCommentsArr: any[] = comments?.concat(res.comments);
          // const tempMap: Map<string, string[]> = new Map<string, string[]>();
          // for (let i = 0; i < tempCommentsArr.length; ++i) {
          //   tempUsernameList.push(tempCommentsArr[i].userName);
          //   if (tempMap.get(tempCommentsArr[i].userName[0]) !== undefined) {
          //     const tempArr: string[] | undefined = tempMap.get(tempCommentsArr[i].userName[0]);
          //     if (tempArr !== undefined) {
          //       tempArr.push(tempCommentsArr[i].userName);
          //       tempMap.set(tempCommentsArr[i].userName[0], tempArr);
          //     }
          //   } else {
          //     tempMap.set(tempCommentsArr[i].userName[0], tempCommentsArr[i].userName);
          //   }
          // }
          // tempMap.set("all", tempUsernameList);
          // setListOfUsersMap(tempMap);
          // setListOfUsers(tempUsernameList);
          setComments(tempCommentsArr);
          setLastKey(res.lastKey);
          event.target.complete();
        }
      });
      commentsLoaded.catch((err) => {
        Toast.error(err);
      })
    } else {
      console.log("HUH")
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
          // const tempUsernameList: string[] = [];
          // const tempMap: Map<string, string[]> = new Map<string, string[]>();
          // for (let i = 0; i < res.comments.length; ++i) {
          // tempUsernameList.push(res.comments[i].userName);
          // if (tempMap.get(res.comments[i].userName[0]) !== undefined) {
          // const tempArr: string[] | undefined = tempMap.get(res.comments[i].userName[0]);
          // if (tempArr !== undefined) {
          // tempArr.push(res.comments[i].userName);
          // tempMap.set(res.comments[i].userName[0], tempArr);
          // }
          // } else {
          // tempMap.set(res.comments[i].userName[0], res.comments[i].userName);
          // }
          // }
          // tempMap.set("all", tempUsernameList);
          // console.log(tempUsernameList);
          // console.log(tempMap);
          // tempMap.get("all")?.map((username: string, index: number) => {
          //   console.log(username);
          // });
          // setListOfUsersMap(tempMap);
          // setListOfUsers(tempUsernameList);
          setComments(res.comments);
          setLastKey(res.lastKey);
        }
        setCommentsLoading(false);
      });
      commentsLoaded.catch((err) => {
        Toast.error(err);
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
    setCommentsLoading(true);
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
    // history.push("/about/" + uid);
    dynamicNavigate("about/" + uid, 'forward');
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

  const isEnterPressed = (key: any) => {
    if (key === "Enter") {
      handleCommentSubmit();
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

  useEffect(() => {
    console.log('post');
    // setShowTabs(false);
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
    }
  }, [user, schoolName, match.params.key]);

  return (
    <IonPage>
      <IonContent ref={contentRef} scrollEvents>
        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios">
            {post && post.userName &&
              <IonTitle>{post.userName}'s Post</IonTitle>
            }
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonButton
                onClick={() => {
                  navigateBack();
                }}
              >
                <IonIcon icon={chevronBackOutline}></IonIcon> Back
              </IonButton>
            </IonButtons>
            <IonButtons slot='end'>
              <IonButton slot="end" onClick={() => { sharePost(); }}>
                <IonIcon icon={shareOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>
        {/* <IonFab
          style={darkModeToggled ?
            { bottom: `${kbHeight + 115}px`, height: "115px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" } :
            { bottom: `${kbHeight + 115}px`, height: "115px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }}
          className={darkModeToggled ? "text-area-dark" : "text-area-light"}
          vertical="bottom"
          edge={true}
          hidden={!showTags}
        >
          <IonList mode="ios" inset lines="none">
            {listOfUsers.length > 0 && listOfUsersMap &&
              <>
                {listOfUsersMap.get(attedUser)?.map((username: string, index: number) => {
                  return (
                    <IonItem mode="ios" key={index} lines="none">
                      @{username}
                    </IonItem>
                  )
                })}
              </>
            }
          </IonList>
        </IonFab> */}
        {/* <div style={darkModeToggled ? { top: "70vh", bottom: "5vh", height: "25vh", width: "100vw", border: '2px solid #282828', borderRadius: "10px" } : { top: "80vh", height: "20vh", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed" className={darkModeToggled ? "text-area-dark" : "text-area-light"}> */}
        <IonFab style={darkModeToggled ? { bottom: `${kbHeight}px`, height: "115px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" }
          : { bottom: `${kbHeight}px`, height: "115px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed"
          className={darkModeToggled ? "text-area-dark" : "text-area-light"} vertical="bottom" edge>
          <IonTextarea
            mode="ios"
            enterkeyhint="send"
            rows={3}
            style={photo === null ? { width: "80vw", marginLeft: "2.5vw" }
              : { width: "69vw", marginLeft: "2.5vw" }}
            color="secondary"
            spellcheck={true}
            maxlength={300}
            value={comment}
            disabled={deleted || previousCommentLoading}
            placeholder={previousCommentLoading || deleted ? "Please wait..." : "Leave a comment..."}
            id="commentModal"
            onKeyDown={e => isEnterPressed(e.key)}
            // onKeyPress={e => isEnterPressed(e.key)}
            onIonChange={(e: any) => {
              handleChangeComment(e);
            }}
            className={darkModeToggled ? "text-area-dark" : "text-area-light"}
          ></IonTextarea>
          <IonFab vertical="top" horizontal="end">
            <IonGrid>
              <IonRow>
                {photo !== null && photo !== undefined ? (
                  <IonImg className="ion-img-comment" src={photo?.webPath} />
                ) : null}
                <IonFabButton disabled={!showPictureAddButton || previousCommentLoading} onClick={() => { takePicture(); }} color="medium" size="small" mode="ios">
                  <IonIcon size="small" icon={cameraOutline} />
                </IonFabButton>
              </IonRow>
            </IonGrid>
          </IonFab>
        </IonFab>
        <div className="ion-modal">
          {post ? (
            <FadeIn>
              <div>
                <IonList inset={true}>
                  <IonItem lines="none">
                    <IonLabel class="ion-text-wrap">
                      <IonText color="medium">
                        <p>
                          <FadeIn>
                            <IonAvatar
                              onClick={() => {
                                // setComments([]);
                                setComment("");
                                handleUserPageNavigation(
                                  post.uid
                                );
                              }}
                              class="posts-avatar"
                            >
                              <ProfilePhoto uid={post.uid}></ProfilePhoto>
                            </IonAvatar>
                          </FadeIn>
                          {post.userName}
                        </p>
                      </IonText>
                      {post.postType ? (
                        <IonFab vertical="top" horizontal="end">
                          {post.postType !== "general" ?
                            <p
                              style={{
                                fontWeight: "bold",
                                color: getColor(post.postType),
                              }}
                            // onClick={() => {
                            //   localStorage.setItem("lat", (post.location[0].toString()));
                            //   localStorage.setItem("long", (post.location[1].toString()));
                            //   history.push("maps");
                            // }}
                            >
                              {post.postType.toUpperCase()}
                              &nbsp;
                              {post.marker ? (
                                <RoomIcon
                                  style={{ fontSize: "1em" }}
                                  onClick={() => {
                                    localStorage.setItem("lat", (post.location[0].toString()));
                                    localStorage.setItem("long", (post.location[1].toString()));
                                    dynamicNavigate("maps", 'forward');
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
                                  dynamicNavigate("maps", 'forward');
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
                      <Linkify tagName="h3" className="h2-message">
                        {post.message}
                      </Linkify>
                      {"imgSrc" in post && post.imgSrc &&
                        post.imgSrc.length > 0 ? (
                        <>
                          <div style={{ height: "0.75vh" }}>{" "}</div>
                          <div
                            className="ion-img-container"
                            style={{ backgroundImage: `url(${post.imgSrc})`, borderRadius: '10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const img: CapacitorImage = {
                                url: post.imgSrc,
                                title: `${post.userName}'s post`
                              };
                              CapacitorPhotoViewer.show({
                                images: [img],
                                mode: 'one',
                                options: {
                                  title: true
                                }
                              });
                              // PhotoViewer.show(post.imgSrc, `${post.userName}'s post`);
                            }}
                          >
                          </div>
                        </>
                      ) : null}
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
                        disabledLikeButtons === 0
                      }
                      mode="ios"
                      fill="outline"
                      color={
                        post &&
                          user &&
                          "likes" in post &&
                          post.likes[user.uid] !==
                          undefined
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
                        disabledLikeButtons === 0
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
                  </IonItem>
                </IonList>
                <div className="verticalLine"></div>
              </div>
            </FadeIn>

          ) :
            <>
              <FadeIn>
                <IonCard mode="ios" style={{ height: "20vh" }}>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size="2">
                        <IonSkeletonText style={{ height: "5vh", marginLeft : "-1vw" }} animated></IonSkeletonText>
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
          {/* <IonButton onClick={() => {handleCommentSubmit();}}>SEND</IonButton> */}
          {commentsLoading || !comments ? (
            <div
              style={{
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <IonSpinner color="primary" />
            </div>
          ) : (
            <FadeIn>
              <div>
                {comments && comments.length > 0
                  ? comments?.map((comment: any, index: number) => (
                    <IonList inset={true} key={index}>
                      {" "}
                      <IonItem mode="ios" lines="none">
                        <IonLabel class="ion-text-wrap">
                          <IonText color="medium">
                            <p>
                              <FadeIn >
                                <IonAvatar
                                  onClick={() => {
                                    // setComments([]);
                                    setComment("");
                                    handleUserPageNavigation(comment.uid);
                                  }}
                                  class="posts-avatar"
                                >
                                  <ProfilePhoto uid={comment.uid}></ProfilePhoto>

                                </IonAvatar>
                              </FadeIn>
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
                                  });
                                  // PhotoViewer.show(comment.imgSrc, `${comment.userName}'s comment`);
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
                          disabled={disabledLikeButtonsComments === index || deleted}
                          mode="ios"
                          fill="outline"
                          color={
                            comment &&
                              user &&
                              "likes" in comment &&
                              comment.likes[user.uid] !==
                              undefined
                              ? "primary"
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
                            disabledLikeButtonsComments === index || deleted
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
                {kbHeight !== 0 || kbHeight > 0 ?
                  <>
                    <IonItem lines="none" mode="ios" disabled>
                    </IonItem>
                    <IonItem lines="none" mode="ios" disabled>
                    </IonItem>
                    <IonItem lines="none" mode="ios" disabled>
                    </IonItem>
                    <IonItem lines="none" mode="ios" disabled>
                    </IonItem>
                  </>
                  :
                  null}
              </div>
            </FadeIn>
          )}
          <IonInfiniteScroll
            onIonInfinite={(e: any) => { handleLoadCommentsNextBatch(e) }}
            disabled={(lastKey.length == 0) || (commentsLoading) || (comments && comments.length < 20)}
            position="bottom"
          >
            <IonInfiniteScrollContent
              loadingSpinner="crescent"
              loadingText="Loading"
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
          {post ? (
            <FadeIn>
              <div style={{ height: "25vh" }}>
                <p style={{ textAlign: "center" }}>&#183; </p>
              </div>
            </FadeIn>
          ) : (null)}
          <br></br><br></br>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default React.memo(Post);