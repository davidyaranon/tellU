import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import DeleteIcon from "@mui/icons-material/Delete";
import auth, { getOnePost, removeComment } from '../fbconfig';
import {
  upVote,
  downVote,
  loadComments,
  addComment,
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
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  IonTextarea,
  IonToolbar,
  useIonViewDidEnter,
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
  const [comments, setComments] = useState<any[] | null>([]);
  const [comment, setComment] = useState<string>("");
  const Toast = useToast();
  const history = useHistory();
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [user] = useAuthState(auth);
  const [postUpvotes, setPostUpvotes] = useState<number>(-1);
  const [postDownvotes, setPostDownvotes] = useState<number>(-1);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);

  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };

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
        addComment(postKey, schoolName, comment)
      );
      hasTimedOut.then((commentSent) => {
        setComment("");
        if (commentSent) {
          Toast.success("Comment added");
          if (post) {
            let tempPost = post;
            tempPost.commentAmount += 1;
            setPost(tempPost);
          }
          try {
            // load comments from /schoolPosts/{schoolName}/comments/{post.key}
            const commentsHasTimedOut = promiseTimeout(
              10000,
              loadComments(postKey, schoolName)
            );
            commentsHasTimedOut.then((resComments) => {
              if (resComments == null || resComments == undefined) {
                Toast.error(
                  "Post has been deleted"
                );
              } else {
                //console.log(resComments);
                setComments(resComments);
              }
            });
            commentsHasTimedOut.catch((err) => {
              Toast.error(err);
              setCommentsLoading(false);
            });
          } catch (err: any) {
            console.log(err);
            Toast.error(err.message.toString());
          }
        } else {
          Toast.error("Unable to comment on post");
        }
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
          setPostUpvotes(res.upVotes);
          setPostDownvotes(res.downVotes);
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

  const getPostComments = () => {
    setCommentsLoading(true);
    if (postKey && schoolName) {
      const commentsLoaded = promiseTimeout(7500, loadComments(postKey, schoolName));
      commentsLoaded.then((res) => {
        if (res) {
          setComments(res);
        }
      });
      commentsLoaded.catch((err) => {
        Toast.error(err);
      })
    }
    setCommentsLoading(false);
  };

  const deleteComment = async (index: number) => {
    setCommentsLoading(true);
    if (comments && post && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(5000, removeComment(commentBeingDeleted, schoolName, postKey));
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

  useIonViewDidEnter(() => {
    setShowTabs(false);
    if (user && schoolName) {
      getPost();
      getPostComments();
    }
  }, [user, schoolName]);

  return (
    <IonPage>
      <IonContent>
        <div style={darkModeToggled ? { top: "80vh", height: "20vh", width: "100vw", border: '2px solid #282828', borderRadius: "10px" } : { top: "80vh", height: "20vh", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed" className={darkModeToggled ? "text-area-dark" : "text-area-light"}>
          <IonTextarea
            rows={4}
            style={{ width: "95vw", height: "10vh", marginLeft: "2.5vw" }}
            color="secondary"
            spellcheck={true}
            maxlength={200}
            value={comment}
            placeholder="Leave a comment..."
            id="commentModal"
            onIonChange={(e: any) => {
              handleChangeComment(e);
            }}
            className={darkModeToggled ? "text-area-dark" : "text-area-light"}
          ></IonTextarea>
          <IonRow>
            <IonCol></IonCol>
            <IonCol>
              <IonButton onClick={() => { handleCommentSubmit(); }} style={{ height: "5vh", marginTop: "2%", width: "80vw", textAlign: "center" }} fill="outline" >Comment</IonButton>
            </IonCol>
            <IonCol></IonCol>
          </IonRow>        </div>
        <div className="ion-modal">
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
                              setComments([]);
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
                        </IonFab>
                      ) : null}
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
          ) : null}

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
                  ? comments?.map((comment: any, index) => (
                    <IonList inset={true} key={index}>
                      {" "}
                      <IonItem lines="none">
                        <IonLabel class="ion-text-wrap">
                          <IonText color="medium">
                            <p>
                              <IonAvatar
                                onClick={() => {
                                  setComments([]);
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
                        <div></div>
                      </IonItem>
                      <IonItem lines="none" mode="ios">
                        <IonButton
                          mode="ios"
                          fill="outline"
                          color="medium"
                        >
                          <KeyboardArrowUpIcon />
                          <p>{comment.upVotes} </p>
                        </IonButton>
                        <IonButton
                          mode="ios"
                          fill="outline"
                          color="medium"
                        >
                          <KeyboardArrowDownIcon />
                          <p>{comment.downVotes} </p>
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
          <div style={{ height: "25vh" }}>
            <p style={{ textAlign: "center" }}>&#183; </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default React.memo(Post);