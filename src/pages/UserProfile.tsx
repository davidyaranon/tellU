import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { removeComment } from '../fbconfig';
import {
  getUserPosts,
  getNextBatchUserPosts,
  getUserData,
  storage,
  upVote,
  downVote,
  loadComments,
  addComment,
  promiseTimeout,
} from "../fbconfig";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFab,
  IonHeader,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonModal,
  IonNote,
  IonPage,
  IonRow,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonTextarea,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from "@ionic/react";
import FadeIn from "react-fade-in";
import { ref, getDownloadURL } from "firebase/storage";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import "../App.css";
import TimeAgo from "javascript-time-ago";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { arrowBack } from "ionicons/icons";
import ForumIcon from '@mui/icons-material/Forum';
import { getColor, timeout } from '../components/functions';

interface MatchParams {
  uid: string;
}

export const UserProfile = ({ match }: RouteComponentProps<MatchParams>) => {
  const uid = match.params.uid;
  const timeAgo = new TimeAgo("en-US");
  const [busy, setBusy] = useState<boolean>(false);
  const [noPostsYet, setNoPostsYet] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const history = useHistory();
  const schoolName = useSelector((state: any) => state.user.school);
  const [username, setUsername] = useState<string>("");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [lastKey, setLastKey] = useState<any>();
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentModalPostIndex, setCommentModalPostIndex] =
    useState<number>(-1);
  const [commentModalPostUpvotes, setCommentModalPostUpvotes] =
    useState<number>(-1);
  const [commentModalPostDownvotes, setCommentModalPostDownvotes] =
    useState<number>(-1);
  const [commentModalPost, setCommentModalPost] = useState<any | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const [comments, setComments] = useState<any[] | null>(null);
  const [comment, setComment] = useState<string>("");
  const Toast = useToast();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const titleStyle = {
    fontSize: "6.5vw",
  };
  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };
  const handleUserPageNavigation = (uid: string) => {
    if (commentModalPost) {
      if (commentModalPost.uid != uid) {
        history.push("home/about/" + uid);
      }
    }
  };
  const deleteComment = async (index: number) => {
    setCommentsLoading(true);
    if (comments && commentModalPost && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(5000, removeComment(commentBeingDeleted, schoolName, commentModalPost.key));
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
            //console.log(tempComments);
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
  const handleCommentSubmit = async (postKey: string) => {
    if (comment.trim().length == 0) {
      Toast.error("Input a comment");
    } else {
      setCommentsBusy(true);
      const hasTimedOut = promiseTimeout(10000, addComment(postKey, schoolName, comment));
      hasTimedOut.then((commentSent) => {
        setComment("");
        if (commentSent) {
          Toast.success("Comment added");
          if (userPosts) {
            let tempPosts: any[] = [...userPosts];
            tempPosts[commentModalPostIndex].commentAmount += 1;
            setUserPosts(tempPosts);
          }
          try {
            // load comments from /schoolPosts/{schoolName}/comments/{post.key}
            const commentsHasTimedOut = promiseTimeout(10000, loadComments(postKey, schoolName));
            commentsHasTimedOut.then((resComments) => {
              if (resComments == null || resComments == undefined) {
                Toast.error(
                  "Post has been deleted"
                );
              } else {
                setComments(resComments);
              }
            });
            commentsHasTimedOut.catch((err) => {
              Toast.error(err);
              setCommentsBusy(false);
            });
          } catch (err: any) {
            console.log(err);
            Toast.error(err.message.toString());
          }
        } else {
          Toast.error("Unable to comment on post");
        }
        setCommentsBusy(false);
      });
      hasTimedOut.catch((err) => {
        Toast.error(err);
        setCommentsBusy(false);
      });
    }
  };

  const handleCommentModal = async (post: any, postIndex: number) => {
    setCommentsLoading(true);
    setCommentModalPostIndex(postIndex);
    setCommentModalPostDownvotes(post.downVotes);
    setCommentModalPostUpvotes(post.upVotes);
    setCommentModalPost(post);
    setShowCommentModal(true);
    try {
      // load comments from /schoolPosts/{schoolName}/comments/{post.key}
      const resComments = await loadComments(post.key, schoolName);
      if (resComments != null && resComments != undefined) {
        //console.log(resComments);
        setComments(resComments);
        setCommentsLoading(false);
      } else {
        //console.log(resComments);
        Toast.error(
          "Post has been deleted"
        );
      }
    } catch (err: any) {
      console.log(err);
      Toast.error(err.message.toString());
    }
  };
  // const getSrc = (url : string) => {
  //   getImgSrc(url).then((src) => {
  //     return src;
  //   });
  //   return "";
  // }
  const handleUpVote = async (postKey: string, index: number, post: any) => {
    const val = await upVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
        tempPosts[index].upVotes += val;
        setCommentModalPostUpvotes(commentModalPostUpvotes + val);
        if (tempPosts[index].likes[user.uid]) {
          delete tempPosts[index].likes[user.uid];
        } else {
          if (tempPosts[index].dislikes[user.uid]) {
            delete tempPosts[index].dislikes[user.uid];
            tempPosts[index].downVotes -= 1;
            setCommentModalPostDownvotes(commentModalPostDownvotes - 1);
          }
          tempPosts[index].likes[user.uid] = true;
        }
        setUserPosts(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to like post :(");
    }
  };
  // const handlePhotoClick = (url : string) => {
  //   getImgSrc(url).then((src) => {
  //     PhotoViewer.show(src);
  //   });
  // };
  const handleDownVote = async (postKey: string, index: number, post: any) => {
    const val = await downVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
        setCommentModalPostDownvotes(commentModalPostDownvotes + val);
        tempPosts[index].downVotes += val;
        if (tempPosts[index].dislikes[user.uid]) {
          delete tempPosts[index].dislikes[user.uid];
        } else {
          if (tempPosts[index].likes[user.uid]) {
            delete tempPosts[index].likes[user.uid];
            tempPosts[index].upVotes -= 1;
            setCommentModalPostUpvotes(commentModalPostUpvotes - 1);
          }
          tempPosts[index].dislikes[user.uid] = true;
        }
        setUserPosts(tempPosts);
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
      handleCommentSubmit(commentModalPost.key);
    }
  };
  // const getImgSrc = async (postUrl : string) => {
  //   const imgSrc = await getDownloadURL(ref(storage, postUrl));
  //   return imgSrc;
  // };
  const getDate = (timestamp: any) => {
    const time = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    return timeAgo.format(time);
  };
  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
  };
  const fetchMorePosts = (event: any) => {
    if (lastKey) {
      getNextBatchUserPosts(schoolName, uid, lastKey)
        .then((res: any) => {
          setLastKey(res.lastKey);
          setUserPosts(userPosts.concat(res.userPosts));
          event.target.complete();
          if (res.userPosts.length == 0) {
            setNoMorePosts(true);
          }
        })
        .catch((err) => {
          Toast.error(err.message.toString());
        });
    } else {
      setNoMorePosts(true);
    }
  };

  useIonViewWillEnter(() => {
    setBusy(true);
  })

  useIonViewDidEnter(() => {
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (uid && schoolName) {
        getUserData(uid)
          .then((res: any) => {
            setUsername(res[0].userName);
            getUserPosts(schoolName, uid)
              .then((res: any) => {
                // first batch
                if (res.userPosts.length > 0) {
                  // console.log(res.userPosts);
                  setUserPosts(res.userPosts);
                  setLastKey(res.lastKey);
                } else {
                  setNoPostsYet(true);
                }
              })
              .catch((err) => {
                Toast.error(err.message.toString());
              });
            //console.log();
            getDownloadURL(ref(storage, "profilePictures/" + uid + "photoURL"))
              .then((url) => {
                setProfilePhoto(url);
                setBusy(false);
              })
              .catch((err) => {
                if (err.code === "storage/object-not-found") {
                  getDownloadURL(
                    ref(
                      storage,
                      "profilePictures/301-3012952_this-free-clipart-png-design-of-blank-avatar.png"
                    )
                  )
                    .then((url) => {
                      setProfilePhoto(url);
                      setBusy(false);
                    })
                    .catch((err) => {
                      Toast.error(err.message.toString());
                    });
                } else {
                  Toast.error(err.message.toString());
                }
              });
          })
          .catch((err) => {
            Toast.error(err.message.toString());
          });
      }
    }
  }, [user, uid, schoolName]);

  if (!noPostsYet) {
    return (
      <IonPage>
        <IonContent>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios" >
              <IonButtons slot="start">
                <IonButton
                  mode="ios"
                  onClick={() => {
                    history.go(-1);
                  }}
                >
                  <IonIcon icon={arrowBack}></IonIcon> Back
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </div>

          <IonLoading
            spinner="dots"
            message="Adding comment"
            duration={0}
            isOpen={commentsBusy}
          ></IonLoading>

          <IonModal backdropDismiss={false} isOpen={showCommentModal}>
            <IonContent>
              <div slot="fixed" style={{ width: "100%" }}>
                <IonToolbar mode="ios" >
                  <IonButtons slot="start">
                    <IonButton
                      mode="ios"
                      onClick={() => {
                        setShowCommentModal(false);
                        setComment("");
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
                {commentModalPost ? (
                  <div>
                    <IonList inset={true}>
                      <IonItem lines="none">
                        <IonLabel class="ion-text-wrap">
                          <IonText color="medium">
                            <p>
                              <IonAvatar
                                onClick={() => {
                                  // setComments([]);
                                  // setShowCommentModal(false);
                                  // setComment("");
                                }}
                                class="posts-avatar"
                              >
                                <IonImg
                                  src={commentModalPost.photoURL}
                                ></IonImg>
                              </IonAvatar>
                              {commentModalPost.userName}
                            </p>
                          </IonText>
                          {commentModalPost.postType != "general" ? (
                            <IonFab vertical="top" horizontal="end">
                              <p
                                style={{
                                  fontWeight: "bold",
                                  color: getColor(commentModalPost.postType),
                                }}
                              >
                                {commentModalPost.postType.toUpperCase()}
                              </p>
                              <IonNote style={{ fontSize: "0.85em" }}>
                                {getDate(commentModalPost.timestamp)}
                              </IonNote>
                            </IonFab>
                          ) : (
                            <IonFab vertical="top" horizontal="end">
                              <IonNote style={{ fontSize: "0.85em" }}>
                                {getDate(commentModalPost.timestamp)}
                              </IonNote>
                            </IonFab>
                          )}
                          <h2 className="h2-message">
                            {commentModalPost.message}
                          </h2>
                        </IonLabel>
                        <div id={commentModalPost.postType}></div>
                      </IonItem>
                      <IonItem lines="none" mode="ios">
                        <IonButton
                          onAnimationEnd={() => {
                            setLikeAnimation(-1);
                          }}
                          className={
                            likeAnimation === commentModalPostIndex
                              ? "likeAnimation"
                              : ""
                          }
                          disabled={
                            disabledLikeButtons === commentModalPostIndex
                          }
                          mode="ios"
                          fill="outline"
                          color={
                            userPosts &&
                              user &&
                              userPosts[commentModalPostIndex].likes[user.uid] !==
                              undefined
                              ? "primary"
                              : "medium"
                          }
                          onClick={() => {
                            setLikeAnimation(commentModalPostIndex);
                            setDisabledLikeButtons(commentModalPostIndex);
                            handleUpVote(
                              commentModalPost.key,
                              commentModalPostIndex,
                              commentModalPost
                            );
                          }}
                        >
                          <KeyboardArrowUpIcon />
                          <p>{commentModalPostUpvotes} </p>
                        </IonButton>
                        <p>&nbsp;</p>
                        <IonButton
                          onAnimationEnd={() => {
                            setDislikeAnimation(-1);
                          }}
                          className={
                            dislikeAnimation === commentModalPostIndex
                              ? "likeAnimation"
                              : ""
                          }
                          disabled={
                            disabledLikeButtons === commentModalPostIndex
                          }
                          mode="ios"
                          fill="outline"
                          color={
                            userPosts &&
                              user &&
                              userPosts[commentModalPostIndex].dislikes[
                              user.uid
                              ] !== undefined
                              ? "danger"
                              : "medium"
                          }
                          onClick={() => {
                            setDislikeAnimation(commentModalPostIndex);
                            setDisabledLikeButtons(commentModalPostIndex);
                            handleDownVote(
                              commentModalPost.key,
                              commentModalPostIndex,
                              commentModalPost
                            );
                          }}
                        >
                          <KeyboardArrowDownIcon />
                          <p>{commentModalPostDownvotes} </p>
                        </IonButton>
                      </IonItem>
                    </IonList>
                    <div className="verticalLine"></div>
                    {commentModalPost.imgSrc &&
                      commentModalPost.imgSrc.length > 0 ? (
                      <IonCard style={{ bottom: "7.5vh" }}>
                        <IonCardContent>
                          <IonImg
                            onClick={() => {
                              PhotoViewer.show(commentModalPost.imgSrc);
                            }}
                            src={commentModalPost.imgSrc}
                          ></IonImg>
                        </IonCardContent>
                      </IonCard>
                    ) : null}
                  </div>
                ) : null}
                {commentsLoading && !comments ? (
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
                  <div>
                    {comments && comments.length > 0
                      ? comments?.map((comment: any, index) => (
                        <IonList inset={true} key={index}>
                          {" "}
                          {/*dont do this, change index!*/}
                          <IonItem lines="none">
                            <IonLabel class="ion-text-wrap">
                              <IonText color="medium">
                                {commentModalPost.uid != comment.uid ? (
                                  <p>
                                    <IonAvatar
                                      onClick={() => {
                                        setShowCommentModal(false);
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
                                ) : (
                                  <p>
                                    <IonAvatar
                                      // onClick={() => {
                                      //   setComments([]);
                                      //   setShowCommentModal(false);
                                      //   setComment("");
                                      //   //handleUserPageNavigation(comment.uid);
                                      // }}
                                      class="posts-avatar"
                                    >
                                      <IonImg
                                        src={comment?.photoURL!}
                                      ></IonImg>
                                    </IonAvatar>
                                    {comment.userName}
                                  </p>
                                )}
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
                              disabled
                            >
                              <KeyboardArrowUpIcon />
                              <p>{comment.upVotes} </p>
                            </IonButton>
                            <IonButton
                              mode="ios"
                              fill="outline"
                              color="medium"
                              disabled
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
                )}
                <div style={{ height: "25vh" }}>
                  <p style={{ textAlign: "center" }}>&#183; </p>
                </div>
              </div>
            </IonContent>
          </IonModal>
          <br></br>
          <FadeIn>
            <IonCard>
              <IonCardContent>
                {busy ? (
                  <div>
                    <IonAvatar className="user-avatar">
                      <IonLabel>
                        <IonSkeletonText animated={true} />
                      </IonLabel>
                    </IonAvatar>
                    <IonFab vertical="center">
                      <IonLabel>
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "50vw", height: "1.75em" }}
                        />
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "50vw" }}
                        />
                      </IonLabel>
                    </IonFab>
                  </div>
                ) : (
                  <div>
                    <IonAvatar className="user-avatar">
                      <IonImg src={profilePhoto} />
                    </IonAvatar>
                    <IonFab vertical="center">
                      <p style={{ fontSize: "1.5em" }}>{username}</p>
                      <IonNote style={{ fontSize: "1em" }}>
                        {schoolName}
                      </IonNote>
                    </IonFab>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
            <div style={{ textAlign: "center", alignItems: "center" }}>
              <IonLabel>Posts</IonLabel>
            </div>
          </FadeIn>

          <div>
            <>
              {userPosts && userPosts.length > 0
                ? userPosts.map((post: any, index: number) => {
                  if (busy) {
                    return (
                      <FadeIn key={post.key}>
                        <IonList inset={true} mode="ios">
                          <IonItem lines="none" mode="ios">
                            <IonLabel>
                              <IonFab horizontal="end">
                                <IonSkeletonText
                                  animated
                                  style={{
                                    fontSize: "0.75em",
                                    width: "30vw",
                                  }}
                                />
                              </IonFab>
                              <IonFab horizontal="start">
                                <p
                                  style={{
                                    fontWeight: "bold",
                                    color: getColor(post.postType),
                                  }}
                                >
                                  <IonSkeletonText
                                    style={{
                                      width: "30vw",
                                      height: "1.75em",
                                    }}
                                    animated
                                  />
                                </p>
                              </IonFab>
                              <br></br>
                              <h3
                                className="h2-message"
                                style={{
                                  marginLeft: "2.5%",
                                  marginTop: "5%",
                                }}
                              >
                                {" "}
                                <IonSkeletonText animated />{" "}
                              </h3>

                              {post.imgSrc && post.imgSrc.length > 0 ? (
                                <div>
                                  <br></br>
                                  <br></br>
                                  <IonSkeletonText
                                    style={{ height: "50vw" }}
                                    animated
                                  />
                                </div>
                              ) : null}
                            </IonLabel>
                          </IonItem>
                        </IonList>
                      </FadeIn>
                    );
                  }
                  return (
                    <FadeIn key={post.key}>
                      <IonList inset={true} mode="ios">
                        <IonItem lines="none" mode="ios">
                          <IonLabel>
                            <IonFab horizontal="end">
                              <IonNote style={{ fontSize: "0.75em" }}>
                                {" "}
                                {getDate(post.timestamp)}{" "}
                              </IonNote>
                            </IonFab>
                            <IonFab horizontal="start">
                              {post.postType != "general" ? (
                                <p
                                  style={{
                                    fontWeight: "bold",
                                    color: getColor(post.postType),
                                  }}
                                >
                                  {post.postType.toUpperCase()}
                                </p>
                              ) : null}
                            </IonFab>
                            <br></br>
                            <h3
                              className="h2-message"
                              style={{ marginLeft: "4.5%", marginTop: "5%" }}
                            >
                              {" "}
                              {post.message}{" "}
                            </h3>

                            {post.imgSrc && post.imgSrc.length > 0 ? (
                              <div>
                                <br></br>
                                <br></br>
                                <IonImg
                                  className="ion-img-container"
                                  onClick={() => {
                                    PhotoViewer.show(post.imgSrc);
                                  }}
                                  src={post.imgSrc}
                                />
                              </div>
                            ) : (
                              <>
                                {post.url.length > 0 ? (
                                  <div>
                                    <br></br>
                                    <br></br>
                                    <IonImg
                                      className="ion-img-container"
                                      onClick={() => {
                                        PhotoViewer.show(post.imgSrc);
                                      }}
                                      src={post.imgSrc}
                                    />
                                  </div>
                                ) : null}
                              </>
                            )}
                          </IonLabel>
                        </IonItem>
                        <FadeIn>
                          <IonItem lines="none" mode="ios">
                            <IonButton
                              onAnimationEnd={() => {
                                setLikeAnimation(-1);
                              }}
                              className={
                                likeAnimation === post.key
                                  ? "likeAnimation"
                                  : ""
                              }
                              disabled={disabledLikeButtons === index}
                              mode="ios"
                              fill="outline"
                              color={
                                userPosts &&
                                  user &&
                                  userPosts[index].likes[user.uid] !== undefined
                                  ? "primary"
                                  : "medium"
                              }
                              onClick={() => {
                                setLikeAnimation(post.key);
                                setDisabledLikeButtons(index);
                                handleUpVote(post.key, index, post);
                              }}
                            >
                              <KeyboardArrowUpIcon />
                              <p>{post.upVotes} </p>
                            </IonButton>
                            <p>&nbsp;</p>
                            <IonButton
                              mode="ios"
                              color="medium"
                              onClick={() => {
                                handleCommentModal(post, index);
                              }}
                            >
                              <ForumIcon />
                              <p>&nbsp; {post.commentAmount} </p>
                            </IonButton>
                            <IonButton
                              onAnimationEnd={() => {
                                setDislikeAnimation(-1);
                              }}
                              className={
                                dislikeAnimation === post.key
                                  ? "likeAnimation"
                                  : ""
                              }
                              disabled={disabledLikeButtons === index}
                              mode="ios"
                              fill="outline"
                              color={
                                userPosts &&
                                  user &&
                                  userPosts[index].dislikes[user.uid] !==
                                  undefined
                                  ? "danger"
                                  : "medium"
                              }
                              onClick={() => {
                                setDislikeAnimation(post.key);
                                setDisabledLikeButtons(index);
                                handleDownVote(post.key, index, post);
                              }}
                            >
                              <KeyboardArrowDownIcon />
                              <p>{post.downVotes} </p>
                            </IonButton>
                          </IonItem>
                        </FadeIn>
                      </IonList>
                    </FadeIn>
                  );
                })
                : null}
            </>
            <IonInfiniteScroll
              onIonInfinite={(e: any) => { fetchMorePosts(e) }}
              disabled={noMorePosts}
            >
              <IonInfiniteScrollContent
                loadingSpinner="bubbles"
                loadingText="Loading"
              ></IonInfiniteScrollContent>
            </IonInfiniteScroll>
            {/* <FadeIn>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <IonButton
                  color="medium"
                  mode="ios"
                  fill="outline"
                  expand="block"
                  disabled={noMorePosts}
                  onClick={(e) => {
                    fetchMorePosts(e);
                  }}
                >
                  LOAD MORE POSTS{" "}
                </IonButton>
              </div>
            </FadeIn> */}
          </div>
        </IonContent>
      </IonPage>
    );
  } else {
    return (
      <IonPage>
        <IonContent>
          <IonHeader mode="ios">
            <IonToolbar mode="ios">
              <IonButtons slot="start">
                <IonButton
                  onClick={() => {
                    //console.log("going home");
                    history.go(-1);
                  }}
                >
                  <IonIcon icon={arrowBack}></IonIcon>
                  Back
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <FadeIn>
            <IonCard>
              <IonCardContent>
                <IonAvatar className="user-avatar">
                  <IonImg src={profilePhoto} />
                </IonAvatar>
                <IonFab vertical="center">
                  <p style={{ fontSize: "1.5em" }}>{username}</p>
                  <IonNote style={{ fontSize: "1em" }}>{schoolName}</IonNote>
                </IonFab>
              </IonCardContent>
            </IonCard>
            <div style={{ textAlign: "center", alignItems: "center" }}>
              <IonLabel>NO POSTS YET</IonLabel>
            </div>
          </FadeIn>
        </IonContent>
      </IonPage>
    );
  }
};