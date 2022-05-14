import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import DeleteIcon from "@mui/icons-material/Delete";
import auth, { addCommentNew, addTestMessage, downVoteComment, getOnePost, loadCommentsNew, loadCommentsNewNextBatch, removeComment, removeCommentNew, upVoteComment } from '../fbconfig';
import {
  upVote,
  downVote,
  promiseTimeout,
} from "../fbconfig";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFab,
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
  IonText,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import FadeIn from "react-fade-in";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import "../App.css";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { cameraOutline, chatbubblesOutline, arrowBack } from "ionicons/icons";
import { getColor, timeout } from '../components/functions';
import UIContext from "../my-context";
import { Keyboard } from "@capacitor/keyboard";

interface MatchUserPostParams {
  key: string;
}

const Post = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const postKey = match.params.key;
  const { setShowTabs } = React.useContext(UIContext);
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const timeAgo = new TimeAgo("en-US");
  const [busy, setBusy] = useState<boolean>(false);
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
  const [postUpvotes, setPostUpvotes] = useState<number>(-1);
  const [postDownvotes, setPostDownvotes] = useState<number>(-1);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState<string>("");
  const contentRef = useRef<HTMLIonContentElement | null>(null);

  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
  };

  const handleCommentSubmit = () => {
    if (comment.trim().length == 0) {
      Toast.error("Input a comment");
    } else {
      setCommentsLoading(true);
      const hasTimedOut = promiseTimeout(
        10000,
        addCommentNew(postKey, schoolName, comment)
      );
      hasTimedOut.then((commentSent: any) => {
        if (commentSent) {
          Toast.success("Comment added");
          if (comments) {
            setComments(comments?.concat(commentSent));
          }
        } else {
          Toast.error("Unable to comment on post");
        }
        setComment("");
        setCommentsLoading(false);
      });
      hasTimedOut.catch((err) => {
        Toast.error(err);
        setCommentsLoading(false);
      });
    }
  };

  const getPost = () => {
    if (postKey && schoolName) {
      const onePost = promiseTimeout(7500, getOnePost(postKey, schoolName));
      onePost.then((res) => {
        if (res) {
          setPost(res);
          setPostUpvotes(Object.keys(res.likes).length);
          setPostDownvotes(Object.keys(res.dislikes).length);
        } else {
          Toast.error("Post has been deleted");
        }
      });
      onePost.catch((err) => {
        Toast.error(err);
      });
    } else {
      Toast.error("Unable to load message rn");
    }
  };


  const sendTestMessage = () => {
    let messageText = "testDoc";
    addTestMessage({ text: messageText })
    .then((result) => {
      // Read result of the Cloud Function.
      /** @type {any} */
      const data : any = result.data;
      const sanitizedMessage = data.text;
      console.log(data + '\n' + sanitizedMessage);
    })
    .catch((error) => {
      // Getting the Error details.
      const code = error.code;
      const message = error.message;
      const details = error.details;
      console.log(code + '\n' + message + '\n' + details);
      // ...
    });
  }

  const handleLoadCommentsNextBatch = async (event: any) => {
    if (postKey && schoolName && lastKey) {
      const commentsLoaded = promiseTimeout(7500, loadCommentsNewNextBatch(postKey, schoolName, lastKey));
      commentsLoaded.then((res) => {
        if (res) {
          setComments(comments?.concat(res.comments));
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
    if(timestamp && "nanoseconds" in timestamp && "seconds" in timestamp){
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
      commentsLoaded.then((res) => {
        if (res) {
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

  const deleteComment = async (index: number) => {
    setCommentsLoading(true);
    if (comments && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(5000, removeCommentNew(commentBeingDeleted, schoolName, postKey));
      didDelete.then((res) => {
        if (res) {
          Toast.success("Comment deleted");
          if (comments.length == 0) {
            setComments([]);
          } else {
            let tempComments: any[] = [];
            for (let i = 0; i < comments.length; ++i) {
              if (i !== index) {
                tempComments.push(comments[i]);
              }
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
    history.push("home/about/" + uid);
  };

  const handleUpVoteComment = async (commentKey: string, index: number) => {
    const val = await upVoteComment(schoolName, postKey, commentKey);
    if(val && (val === 1 || val === -1)) {
      if(post && user){
        let tempComments : any[] = [...comments];
        if (tempComments[index].likes[user.uid]) {
          delete tempComments[index].likes[user.uid];
        } else {
          if (tempComments[index].dislikes[user.uid]) {
            delete tempComments[index].dislikes[user.uid];
          }
          tempComments[index].likes[user.uid] = true;
        }
        setComments(tempComments);
        await timeout(1000).then(() => {
          setDisabledLikeButtonsComments(-1);
        });
      }
    } else {
      Toast.error("Unable to like comment");
    }
  };

  const handleDownVoteComment = async (commentKey: string, index: number) => {
    const val = await downVoteComment(schoolName, postKey, commentKey);
    if (val && (val === 1 || val === -1)) {
      if (post && user) {
        let tempComments :any[] = [...comments];
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
        await timeout(1000).then(() => {
          setDisabledLikeButtonsComments(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike comment");
    }
  };

  const handleUpVote = async (post: any) => {
    const val = await upVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (post && user) {
        let tempPost = post;
        tempPost.upVotes += val;
        setPostUpvotes(postUpvotes + val);
        if (tempPost.likes[user.uid]) {
          delete tempPost.likes[user.uid];
        } else {
          if (tempPost.dislikes[user.uid]) {
            delete tempPost.dislikes[user.uid];
            tempPost.downVotes -= 1;
            setPostDownvotes(postDownvotes - 1);
          }
          tempPost.likes[user.uid] = true;
        }
        setPost(tempPost);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to like post :(");
    }
  };

  const handleDownVote = async (post: any) => {
    const val = await downVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (post && user) {
        let tempPost = post;
        setPostDownvotes(postDownvotes + val);
        tempPost.downVotes += val;
        if (tempPost.dislikes[user.uid]) {
          delete tempPost.dislikes[user.uid];
        } else {
          if (tempPost.likes[user.uid]) {
            delete tempPost.likes[user.uid];
            tempPost.upVotes -= 1;
            setPostUpvotes(postUpvotes - 1);
          }
          tempPost.dislikes[user.uid] = true;
        }
        setPost(tempPost);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
  };

  const isEnterPressed = (key: any) => {
    if (key === "Enter") {
      Keyboard.hide().then(() => { handleCommentSubmit() });
    }
  };

  useEffect(() => {
    // setShowTabs(false);
    if (user && schoolName) {
      getPost();
      getPostComments();
    }
  }, [user, schoolName]);

  return (
    <IonPage>
      <IonContent ref={contentRef} scrollEvents>
        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios">
            <IonButtons slot="start">
              <IonButton
                onClick={() => {
                  history.go(-1);
                }}
              >
                <IonIcon icon={arrowBack}></IonIcon> Back
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>
        <div style={darkModeToggled ? { top: "80vh", height: "20vh", width: "100vw", border: '2px solid #282828', borderRadius: "10px" } : { top: "80vh", height: "20vh", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed" className={darkModeToggled ? "text-area-dark" : "text-area-light"}>
          <IonTextarea
            mode="ios"
            enterkeyhint="send"
            rows={3}
            style={{ width: "95vw", height: "10vh", marginLeft: "2.5vw" }}
            color="secondary"
            spellcheck={true}
            maxlength={200}
            value={comment}
            // inputMode="text"
            placeholder="Leave a comment..."
            id="commentModal"
            onKeyPress={e => isEnterPressed(e.key)}
            onIonChange={(e: any) => {
              handleChangeComment(e);
            }}
            className={darkModeToggled ? "text-area-dark" : "text-area-light"}
          ></IonTextarea>
        </div>
        <div className="ion-modal">
          {post ? (
            <FadeIn>
              <div>
                <IonList inset={true}>
                  <IonItem lines="none">
                    <IonLabel class="ion-text-wrap">
                      <IonText color="medium">
                        <p>
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
                            <IonImg
                              src={post.photoURL}
                            ></IonImg>
                          </IonAvatar>
                          {post.userName}
                        </p>
                      </IonText>
                      {post.postType != "general" ? (
                        <IonFab vertical="top" horizontal="end">
                          <p
                            style={{
                              fontWeight: "bold",
                              color: getColor(post.postType),
                            }}
                          >
                            {post.postType.toUpperCase()}
                          </p>
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
                      <h2 className="h2-message">
                        {post.message}
                      </h2>
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
                      <p>{postUpvotes} </p>
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
                      <p>{postDownvotes} </p>
                    </IonButton>
                  </IonItem>
                </IonList>
                <div className="verticalLine"></div>
                {post.imgSrc &&
                  post.imgSrc.length > 0 ? (
                  <IonCard style={{ bottom: "7.5vh" }}>
                    <IonCardContent>
                      <IonImg
                        onClick={() => {
                          PhotoViewer.show(post.imgSrc);
                        }}
                        src={post.imgSrc}
                      ></IonImg>
                    </IonCardContent>
                  </IonCard>
                ) : null}
              </div>
            </FadeIn>
          ) :
            <>
              <FadeIn>
                <IonCard mode="ios" style={{ height: "20vh" }}>
                  <IonCardContent>
                    <IonRow>
                      <IonCol size="2">
                        <IonSkeletonText style={{ height: "5vh" }} animated></IonSkeletonText>
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
              {/* <IonSpinner color="primary" /> */}
            </div>
          ) : (
            <FadeIn>
              <div>
                {comments && comments.length > 0
                  ? comments?.map((comment: any, index: number) => (
                    <IonList inset={true} key={index}>
                      {" "}
                      <IonItem lines="none">
                        <IonLabel class="ion-text-wrap">
                          <IonText color="medium">
                            <p>
                              <IonAvatar
                                onClick={() => {
                                  // setComments([]);
                                  setComment("");
                                  handleUserPageNavigation(comment.uid);
                                }}
                                class="posts-avatar"
                              >
                                <IonImg
                                  src={comment?.photoURL!}
                                ></IonImg>
                              </IonAvatar>
                              {comment.userName}
                            </p>
                          </IonText>
                          <h2 className="h2-message">
                            {" "}
                            {comment.comment}{" "}
                          </h2>
                          {/* {comment.url.length > 0 ? (
                                    <div className="ion-img-container">
                                      <br></br>
                                      <IonImg
                                        onClick={() => {
                                          showPicture(comment.imgSrc);
                                        }}
                                        src={comment.imgSrc}
                                      />
                                    </div>
                                  ) : null} */}
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
                          disabled={disabledLikeButtonsComments === index}
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
                          <p>{Object.keys(comment.likes).length} </p>
                        </IonButton>
                        <IonButton
                          mode="ios"
                          fill="outline"
                          disabled={
                            disabledLikeButtonsComments === index
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
                          <p>{Object.keys(comment.dislikes).length} </p>
                        </IonButton>
                        {user && user.uid === comment.uid ? (
                          <IonFab horizontal="end">
                            <IonButton
                              mode="ios"
                              fill="outline"
                              color="danger"
                              onClick={() => { deleteComment(index); }}
                            >
                              <DeleteIcon />
                            </IonButton>
                          </IonFab>
                        ) : null}
                      </IonItem>
                    </IonList>
                  ))
                  : null}
              </div>
            </FadeIn>
          )}
          <IonInfiniteScroll
            onIonInfinite={(e: any) => { handleLoadCommentsNextBatch(e) }}
            disabled={(lastKey.length == 0) || (commentsLoading)}
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
        </div>
      </IonContent>
    </IonPage>
  )
}

export default React.memo(Post);