import {
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonCardTitle,
  IonCard,
  IonSlides,
  IonSlide,
  IonInfiniteScrollContent,
  IonModal,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonLoading,
  IonText,
  IonAvatar,
  IonNote,
  IonInput,
  IonActionSheet,
  IonButton,
  IonIcon,
  IonRippleEffect,
  IonFab,
  IonFabButton,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSearchbar,
  IonBreadcrumbs,
  IonBreadcrumb,
  IonicSwiper,
  IonCardContent,
  IonRow,
  IonCol,
  IonSpinner,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import {
  arrowBack,
  chatbubblesOutline,
  chevronBack,
  chevronForward,
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { removeComment } from "../fbconfig";
import {
  addComment,
  downVote,
  getTopPostsWithinPastDay,
  loadComments,
  promiseTimeout,
  upVote,
} from "../fbconfig";
import Header, { ionHeaderStyle } from "./Header";
import "../App.css";
import { useHistory } from "react-router";
import { getUserData, getNextBatchUsers } from "../fbconfig";
import { ToastProvider, useToast } from "@agney/ir-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/pagination";
import FadeIn from "react-fade-in";
import DeleteIcon from "@mui/icons-material/Delete";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import TimeAgo from "javascript-time-ago";

function Community() {
  const schoolName = useSelector((state: any) => state.user.school);
  const Toast = useToast();
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const timeAgo = new TimeAgo("en-US");
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [commentModalPost, setCommentModalPost] = useState<any | null>(null);
  const [lastKey, setLastKey] = useState<string>("");
  const [userList, setUserList] = useState<any[]>([]);
  const [comments, setComments] = useState<any[] | null>(null);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const history = useHistory();
  const topPostsCache = localStorage.getItem("topPosts") || "false";
  const [commentModalPostUpvotes, setCommentModalPostUpvotes] =
    useState<number>(-1);
  const [commentModalPostDownvotes, setCommentModalPostDownvotes] =
    useState<number>(-1);
  const [commentModalPostIndex, setCommentModalPostIndex] =
    useState<number>(-1);

  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };

  function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }

  const getColor = (postType: string) => {
    switch (postType) {
      case "general":
        return "#61DBFB";
      case "alert":
        return "#ff3e3e";
      case "buy/Sell":
        return "#179b59";
      case "event":
        return "#fc4ad3";
      case "sighting":
        return "#eed202";
      default:
        break;
    }
  };

  const handleCommentSubmit = async (postKey: string) => {
    if (comment.trim().length == 0) {
      Toast.error("Input a comment");
    } else {
      setCommentsBusy(true);
      const hasTimedOut = promiseTimeout(
        10000,
        addComment(postKey, schoolName, comment)
      );
      hasTimedOut.then((commentSent) => {
        setComment("");
        if (commentSent) {
          Toast.success("Comment added");
          if (topPosts) {
            let tempPosts: any[] = [...topPosts];
            tempPosts[commentModalPostIndex].commentAmount += 1;
            setTopPosts(tempPosts);
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
                  "Comments are currently broken on this post, try again later"
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

  const handleUpVote = async (postKey: string, index: number) => {
    const val = await upVote(schoolName, postKey);
    if (val && (val === 1 || val === -1)) {
      if (topPosts && user) {
        let tempPosts: any[] = [...topPosts];
        tempPosts[index].data.upVotes += val;
        setCommentModalPostUpvotes(commentModalPostUpvotes + val);
        if (tempPosts[index].data.likes[user.uid]) {
          delete tempPosts[index].data.likes[user.uid];
        } else {
          if (tempPosts[index].data.dislikes[user.uid]) {
            delete tempPosts[index].data.dislikes[user.uid];
            tempPosts[index].data.downVotes -= 1;
            setCommentModalPostDownvotes(commentModalPostDownvotes - 1);
          }
          tempPosts[index].data.likes[user.uid] = true;
        }
        setTopPosts(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to like post :(");
    }
  };

  const handleDownVote = async (postKey: string, index: number) => {
    const val = await downVote(schoolName, postKey);
    if (val && (val === 1 || val === -1)) {
      if (topPosts && user) {
        let tempPosts: any[] = [...topPosts];
        setCommentModalPostDownvotes(commentModalPostDownvotes + val);
        tempPosts[index].data.downVotes += val;
        if (tempPosts[index].data.dislikes[user.uid]) {
          delete tempPosts[index].data.dislikes[user.uid];
        } else {
          if (tempPosts[index].data.likes[user.uid]) {
            delete tempPosts[index].data.likes[user.uid];
            tempPosts[index].data.upVotes -= 1;
            setCommentModalPostUpvotes(commentModalPostUpvotes - 1);
          }
          tempPosts[index].data.dislikes[user.uid] = true;
        }
        setTopPosts(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
  };

  const handleUserPageNavigation = (uid: string) => {
    history.push("home/about/" + uid);
  };

  const getDate = (timestamp: any) => {
    const time = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    return timeAgo.format(time);
  };

  const fetchMoreUserData = (key: string) => {
    if (key && key.length > 0) {
      setBusy(true);
      getNextBatchUsers(key)
        .then((res) => {
          setLastKey(res!.lastKey);
          setUserList(userList?.concat(res?.userList));
          setBusy(false);
        })
        .catch((err: any) => {
          Toast.error(err.message.toString());
          setBusy(false);
        });
    }
  };

  const handleCardClick = async (post: any, postIndex: number) => {
    setCommentModalPostIndex(postIndex);
    setCommentModalPostDownvotes(post.data.downVotes);
    setCommentModalPostUpvotes(post.data.upVotes);
    setCommentModalPost(post);
    setCommentsLoading(true);
    setShowModalComment(true);
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
          "Comments are currently broken on this post, try again later"
        );
      }
    } catch (err: any) {
      console.log(err);
      Toast.error(err.message.toString());
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

  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
  };

  useEffect(() => {
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (schoolName) {
        if (topPostsCache != "false") {
          setTopPosts(JSON.parse(topPostsCache));
        }
        getTopPostsWithinPastDay(schoolName).then((res: any) => {
          setTopPosts(res);
          localStorage.setItem("topPosts", JSON.stringify(res));
          //console.log(res);
        });
      }
      setBusy(false);
    }
  }, [user, schoolName]);
  return (
    <React.Fragment>
      <IonContent>
        <IonHeader class="ion-no-border">
          <IonToolbar mode="ios">
            <IonTitle>Top Posts</IonTitle>
            <FadeIn transitionDuration={750}>
              <IonFab horizontal="end">
                <IonIcon icon={chevronForward} />
              </IonFab>
              <IonFab horizontal="start">
                <IonIcon icon={chevronBack} />
              </IonFab>
            </FadeIn>
          </IonToolbar>
        </IonHeader>

        <IonLoading
          message="Please wait..."
          duration={0}
          isOpen={busy}
        ></IonLoading>

        <IonLoading
          spinner="dots"
          message="Adding comment"
          duration={0}
          isOpen={commentsBusy}
        ></IonLoading>

        <IonModal backdropDismiss={false} isOpen={showModalComment}>
          <IonContent>
            <div className="ion-modal">
              <IonToolbar mode="ios">
                <IonButtons slot="start">
                  <IonButton
                    onClick={() => {
                      setShowModalComment(false);
                      setComment("");
                    }}
                  >
                    <IonIcon icon={arrowBack}></IonIcon> Back
                  </IonButton>
                </IonButtons>
              </IonToolbar>
              {commentModalPost && commentModalPost.data ? (
                <FadeIn>
                  <div>
                    <IonList inset={true}>
                      <IonItem lines="none">
                        <IonLabel class="ion-text-wrap">
                          <IonText color="medium">
                            <p>
                              <IonAvatar
                                onClick={() => {
                                  //setComments([]);
                                  setShowModalComment(false);
                                  setComment("");
                                  handleUserPageNavigation(
                                    commentModalPost.data.uid
                                  );
                                }}
                                class="posts-avatar"
                              >
                                <IonImg
                                  src={commentModalPost.data.photoURL}
                                ></IonImg>
                              </IonAvatar>
                              {commentModalPost.data.userName}
                            </p>
                          </IonText>
                          {commentModalPost.data.postType &&
                            commentModalPost.data.postType != "general" ? (
                            <IonFab vertical="top" horizontal="end">
                              <p
                                style={{
                                  fontWeight: "bold",
                                  color: getColor(
                                    commentModalPost.data.postType
                                  ),
                                }}
                              >
                                {commentModalPost.data.postType.toUpperCase()}
                              </p>
                              <IonNote style={{ fontSize: "0.85em" }}>
                                {getDate(commentModalPost.data.timestamp)}
                              </IonNote>
                            </IonFab>
                          ) : (
                            <IonFab vertical="top" horizontal="end">
                              <IonNote style={{ fontSize: "0.85em" }}>
                                {getDate(commentModalPost.data.timestamp)}
                              </IonNote>
                            </IonFab>
                          )}
                          <h2 className="h2-message">
                            {commentModalPost.data.message}
                          </h2>
                        </IonLabel>
                        <div
                          id={commentModalPost.data.postType.replace("/", "")}
                        ></div>
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
                            topPosts &&
                              user &&
                              topPosts[commentModalPostIndex].data.likes[
                              user.uid
                              ] !== undefined
                              ? "primary"
                              : "medium"
                          }
                          onClick={() => {
                            setLikeAnimation(commentModalPostIndex);
                            setDisabledLikeButtons(commentModalPostIndex);
                            handleUpVote(
                              commentModalPost.key,
                              commentModalPostIndex
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
                            topPosts &&
                              user &&
                              topPosts[commentModalPostIndex].data.dislikes[
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
                              commentModalPostIndex
                            );
                          }}
                        >
                          <KeyboardArrowDownIcon />
                          <p>{commentModalPostDownvotes} </p>
                        </IonButton>
                      </IonItem>
                    </IonList>
                    <div className="verticalLine"></div>
                    {commentModalPost.data.imgSrc &&
                      commentModalPost.data.imgSrc.length > 0 ? (
                      <IonCard style={{ bottom: "7.5vh" }}>
                        <IonCardContent>
                          <IonImg
                            onClick={() => {
                              PhotoViewer.show(commentModalPost.data.imgSrc);
                            }}
                            src={commentModalPost.data.imgSrc}
                          ></IonImg>
                        </IonCardContent>
                      </IonCard>
                    ) : null}
                  </div>
                </FadeIn>
              ) : null}
              <p style={{ textAlign: "center" }}>Comments</p>
              <br></br>
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
                    {comments.length > 0
                      ? comments?.map((comment: any, index: number) => (
                        <IonList inset={true} key={index}>
                          <IonItem lines="none">
                            <IonLabel class="ion-text-wrap">
                              <IonText color="medium">
                                <p>
                                  <IonAvatar
                                    onClick={() => {
                                      setComments([]);
                                      setShowModalComment(false);
                                      setComment("");
                                      handleUserPageNavigation(comment.uid);
                                    }}
                                    class="posts-avatar"
                                  >
                                    <IonImg src={comment?.photoURL!}></IonImg>
                                  </IonAvatar>
                                  {comment.userName}
                                </p>
                              </IonText>
                              <h2 className="h2-message">
                                {" "}
                                {comment.comment}{" "}
                              </h2>
                              {comment.url && comment.url.length > 0 ? (
                                <div className="ion-img-container">
                                  <br></br>
                                  <IonImg
                                    onClick={() => {
                                      PhotoViewer.show(comment.imgSrc);
                                    }}
                                    src={comment.imgSrc}
                                  />
                                </div>
                              ) : null}
                            </IonLabel>
                            <div></div>
                          </IonItem>
                          <IonItem lines="none" mode="ios">
                            <IonButton
                              disabled
                              mode="ios"
                              fill="outline"
                              color="medium"
                            >
                              <KeyboardArrowUpIcon />
                              <p>{comment.upVotes} </p>
                            </IonButton>
                            <IonButton
                              disabled
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
                                  onClick={() => {
                                    deleteComment(index);
                                  }}
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
              <IonTextarea
                color="secondary"
                spellcheck={true}
                maxlength={200}
                style={ionInputStyle}
                value={comment}
                placeholder="Leave a comment..."
                id="message"
                onIonChange={(e: any) => {
                  handleChangeComment(e);
                }}
              ></IonTextarea>
              <div className="ion-button-container">
                <IonButton
                  color="transparent"
                  mode="ios"
                  shape="round"
                  fill="outline"
                  expand="block"
                  id="signUpButton"
                  onClick={() => {
                    handleCommentSubmit(commentModalPost.key);
                  }}
                >
                  Comment
                </IonButton>
              </div>
              <wbr></wbr>
              <br></br>
            </div>
          </IonContent>
        </IonModal>

        <Swiper
          slidesPerView={1.5}
        >
          {topPosts && topPosts.length > 0
            ? topPosts.map((post, index) => {
              return (
                <SwiperSlide key={post.key}>
                  <IonCard mode="ios">
                    <IonCardContent
                      style={{ minHeight: "60vh" }}
                      onClick={() => {
                        handleCardClick(post, index);
                      }}
                    >
                      {post.data.postType &&
                        post.data.postType != "general" ? (
                        <IonFab horizontal="end" vertical="top">
                          <p
                            style={{
                              fontWeight: "bold",
                              fontSize: "2.5vw",
                              color: getColor(post.data.postType),
                            }}
                          >
                            {post.data.postType.toUpperCase()}
                          </p>
                        </IonFab>
                      ) : null}
                      <IonCardTitle style={{ fontSize: "medium" }} mode="ios">
                        {post.data.userName}
                      </IonCardTitle>
                      <br></br>
                      <IonNote color="medium" className="subtitle">
                        {post.data.message.length > 150
                          ? post.data.message.substring(0, 150) + "..."
                          : post.data.message}
                      </IonNote>
                      {post.data.imgSrc && post.data.imgSrc.length > 0 ? (
                        <div>
                          <br></br>
                          <IonImg
                            className="ion-img-container"
                            src={post.data.imgSrc}
                          />
                          <br></br>
                          <br></br>
                          <br></br>
                        </div>
                      ) : null}
                    </IonCardContent>
                    <IonFab vertical="bottom">
                      <IonRow>
                        <IonCol size="4">
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
                            onClick={() => {
                              setLikeAnimation(post.key);
                              setDisabledLikeButtons(index);
                              handleUpVote(post.key, index);
                            }}
                            style={{ width: "16vw" }}
                            mode="ios"
                            fill="outline"
                            color={
                              topPosts &&
                                user &&
                                topPosts[index].data.likes[user.uid] !==
                                undefined
                                ? "primary"
                                : "medium"
                            }
                          >
                            <KeyboardArrowUpIcon />
                            <p>{post.data.upVotes} </p>
                          </IonButton>
                        </IonCol>
                        <IonCol size="4">
                          <IonButton
                            onClick={() => {
                              handleCardClick(post, index);
                            }}
                            style={{ width: "16vw" }}
                            mode="ios"
                            color="medium"
                          >
                            <ForumIcon />
                            <p>&nbsp; {post.data.commentAmount} </p>
                          </IonButton>
                        </IonCol>
                        <IonCol size="4">
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
                            style={{ width: "16vw" }}
                            mode="ios"
                            fill="outline"
                            onClick={() => {
                              setDislikeAnimation(post.key);
                              setDisabledLikeButtons(index);
                              handleDownVote(post.key, index);
                            }}
                            color={
                              topPosts &&
                                user &&
                                topPosts[index].data.dislikes[user.uid] !==
                                undefined
                                ? "danger"
                                : "medium"
                            }
                          >
                            <KeyboardArrowDownIcon />
                            <p>{post.data.downVotes} </p>
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonFab>
                  </IonCard>
                </SwiperSlide>
              );
            })
            : null}
        </Swiper>
      </IonContent>
    </React.Fragment>
  );
}

export default React.memo(Community);
