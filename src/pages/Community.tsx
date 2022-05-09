import {
  IonContent,
  IonHeader,
  IonCardTitle,
  IonCard,
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
  IonButton,
  IonIcon,
  IonFab,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonCardContent,
  IonRow,
  IonCol,
  IonSpinner,
  IonPage,
  useIonViewWillEnter,
  IonCheckbox,
  IonInput,
  IonCardSubtitle,
} from "@ionic/react";
import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import {
  addCircleOutline,
  arrowBack,
  chevronBack,
  chevronForward,
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getPolls, getTopWeeklyPosts, getYourPolls, pollVote, removeComment, submitPollFb } from "../fbconfig";
import {
  addComment,
  downVote,
  getTopPostsWithinPastDay,
  loadComments,
  promiseTimeout,
  upVote,
} from "../fbconfig";
import "../App.css";
import { useHistory } from "react-router";
import { getNextBatchUsers } from "../fbconfig";
import { useToast } from "@agney/ir-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/pagination";
import FadeIn from "react-fade-in";
import DeleteIcon from "@mui/icons-material/Delete";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import TimeAgo from "javascript-time-ago";
import { getColor, timeout } from '../components/functions';

// const fetchMoreUserData = (key: string) => {
//   if (key && key.length > 0) {
//     setBusy(true);
//     getNextBatchUsers(key)
//       .then((res) => {
//         setLastKey(res!.lastKey);
//         setUserList(userList?.concat(res?.userList));
//         setBusy(false);
//       })
//       .catch((err: any) => {
//         Toast.error(err.message.toString());
//         setBusy(false);
//       });
//   }
// };

interface Poll {
  id: string,
  text: string,
  uid: string,
};

interface PollAnswer {
  text: string,
};

function Community() {
  const schoolName = useSelector((state: any) => state.user.school);
  const Toast = useToast();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [topWeeklyPosts, setTopWeeklyPosts] = useState<any[]>([]);
  const timeAgo = new TimeAgo("en-US");
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [commentModalPost, setCommentModalPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[] | null>(null);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const history = useHistory();
  const [pollSubmitting, setPollSubmitting] = useState<boolean>(false);
  const [commentModalPostUpvotes, setCommentModalPostUpvotes] =
    useState<number>(-1);
  const [commentModalPostDownvotes, setCommentModalPostDownvotes] =
    useState<number>(-1);
  const [commentModalPostIndex, setCommentModalPostIndex] =
    useState<number>(-1);
  const [pollModalOpen, setPollModalOpen] = useState<boolean>(false);
  const [pollText, setPollText] = useState<string>("");
  const [voteBeingCasted, setVoteBeingCasted] = useState<boolean>(false);
  const [pollOptions, setPollOptions] = useState<PollAnswer[]>([
    { text: "", },
    { text: "", },
    { text: "", },
  ]); // start with three options, include more programatically
  const [polls, setPolls] = useState<any[]>([]);
  const [yourPollsSelected, setYourPollsSelected] = useState<boolean>(false);
  const [yourPolls, setYourPolls] = useState<any[]>([]);
  const [yourPollsLoadedAlready, setYourPollsLoadedAlready] = useState<boolean>(false);

  useIonViewWillEnter(() => {
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (schoolName) {
        const topPostsLoaded = promiseTimeout(10000, getTopPostsWithinPastDay(schoolName));
        topPostsLoaded.then((res: any) => {
          setTopPosts(res);
        });
        topPostsLoaded.catch((err) => {
          Toast.error(err + "\n Check your internet connection");
        });
        const topWeeklyPostsLoaded = promiseTimeout(10000, getTopWeeklyPosts(schoolName));
        topWeeklyPostsLoaded.then((res) => {
          let tempArr = res;
          tempArr = tempArr.sort((a: any, b: any) => (b.data.upVotes) - (a.data.upVotes));
          setTopWeeklyPosts(tempArr);
        });
        topWeeklyPostsLoaded.catch((err) => {
          Toast.error(err + "\n Check your internet connection");
        });
        const pollsLoaded = promiseTimeout(10000, getPolls(schoolName));
        pollsLoaded.then((res) => {
          setPolls(res);
        });
        pollsLoaded.catch((err) => {
          Toast.error(err + "\n Check your internet connection");
        });
      }
      setBusy(false);
    }
  }, [user, schoolName]);

  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };

  const pollInputStyle = {
    height: "15vh",
    width: "95vw",
    marginLeft: "2.5vw"
  }

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

  const handleUpVote = async (postKey: string, index: number, post: any) => {
    const val = await upVote(schoolName, postKey, post);
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

  const handleDownVote = async (postKey: string, index: number, post: any) => {
    const val = await downVote(schoolName, postKey, post);
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

  const handleOpenPollModal = () => {
    setPollModalOpen(true);
  }

  const handlePollTextChange = (e: any) => {
    let currComment = e.detail.value;
    setPollText(currComment);
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
          "Post has been deleted"
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

  const handleChangePollOptions = (index: number, e: any) => {
    let option = e.detail.value;
    let tempOptionsArr: PollAnswer[] = [...pollOptions];
    tempOptionsArr[index].text = option;
    setPollOptions(tempOptionsArr);
  }

  const addPollAnswer = () => {
    let tempPollArr: PollAnswer[] = [...pollOptions];
    tempPollArr.push({ text: "" });
    setPollOptions(tempPollArr);
  }

  const removePollAnswer = () => {
    let tempPollArr: PollAnswer[] = [...pollOptions];
    tempPollArr.pop();
    setPollOptions(tempPollArr);
  }

  const submitPoll = async () => {
    if (!user) {
      Toast.error("Something went wrong, try signing out");
      return;
    }
    if (pollText.trim().length <= 0) {
      Toast.error("Enter poll question");
      return;
    }
    for (let i = 0; i < pollOptions.length; ++i) {
      if (pollOptions[i].text.trim().length <= 0) {
        Toast.error("Enter text for option #" + (i + 1).toString());
        return;
      }
    }
    if (!schoolName) {
      Toast.error("Something went wrong when finding school");
      return;
    }
    setPollSubmitting(true);
    console.log(pollOptions);
    const pollSubmitted = promiseTimeout(10000, submitPollFb(pollText, pollOptions, schoolName, user.displayName, user.uid));
    pollSubmitted.then((res) => {
      if (res) {
        const pollsLoaded = promiseTimeout(10000, getPolls(schoolName));
        pollsLoaded.then((res) => {
          setPolls(res);
          Toast.success("Poll submitted");
        });
        pollsLoaded.catch((err) => {
          Toast.error(err + "\n Check your internet connection");
        });
      } else {
        Toast.error("Something went wrong when submitting poll, please try again");
      }
      setPollSubmitting(false);
      setPollModalOpen(false);
    });
    pollSubmitted.catch((err) => {
      Toast.error(err + "\n Check your internet connection");
      setPollSubmitting(false);
    });
  }

  const getTimeLeft = (timestamp: any) => {
    const time = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const today = new Date();
    const ms = today.getTime() - time.getTime();
    return (7 - (Math.floor(ms / (1000 * 60 * 60 * 24)))) > 0 ? (7 - (Math.floor(ms / (1000 * 60 * 60 * 24)))).toString() : '0';
  }

  const handlePollVote = async (index: number, pollKey: string) => {
    if (user && schoolName) {
      setVoteBeingCasted(true);
      const castedVote = promiseTimeout(5000, pollVote(schoolName, index, pollKey, user.uid));
      castedVote.then((res) => {
        if (res) {
          Toast.success("Vote casted!");
          const pollsLoaded = promiseTimeout(10000, getPolls(schoolName));
          pollsLoaded.then((res) => {
            setPolls(res);
            setVoteBeingCasted(false);
          });
          pollsLoaded.catch((err) => {
            Toast.error(err + "\n Check your internet connection");
          });
        } else {
          Toast.error("Something went wrong when casting vote");
        }
      });
      castedVote.catch((err) => {
        Toast.error(err + '\n Check your internet connection');
      });
    } else {
      Toast.error("Something went wrong when casting a vote");
    }
  }

  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
  };

  return (
    <IonPage>
      <IonContent>

        <IonLoading
          message="Please wait..."
          duration={0}
          isOpen={busy}
        ></IonLoading>

        <IonLoading
          message="Submitting poll..."
          duration={0}
          isOpen={pollSubmitting}
        />

        <IonLoading
          spinner="dots"
          message="Adding comment"
          duration={0}
          isOpen={commentsBusy}
        ></IonLoading>

        <IonModal backdropDismiss={false} isOpen={pollModalOpen}>
          <IonContent>
            <div className="ion-modal">
              <IonToolbar mode="ios">
                <IonButtons slot="start">
                  <IonButton
                    onClick={() => {
                      setPollModalOpen(false);
                      setPollText("");
                    }}
                  >
                    <IonIcon icon={arrowBack}></IonIcon> Back
                  </IonButton>
                </IonButtons>
              </IonToolbar>
              <IonHeader mode="ios">
                <IonTitle>Poll</IonTitle>
                <br />
              </IonHeader>
              <IonInput
                color="secondary"
                type="text"
                autoCapitalize="sentences"
                style={{ width: "90vw", left: "5vw", fontWeight: "bold" }}
                maxlength={100}
                value={pollText}
                placeholder="Ask a question"
                id="pollQuestion"
                onIonChange={(e: any) => {
                  handlePollTextChange(e);
                }}
              ></IonInput>
              {pollOptions && pollOptions.length > 0 ? (
                <IonList mode="ios" inset={true} lines="none">
                  {pollOptions?.map((option, index) => {
                    return (
                      <IonItem key={index}><p style={{ alignSelf: "center" }} slot="start">{(index + 1).toString() + ". "}</p>
                        <IonInput maxlength={50} value={pollModalOpen ? option.text : ""} onIonChange={(e: any) => { handleChangePollOptions(index, e) }} />
                      </IonItem>
                    )
                  })}
                </IonList>
              ) : (null)}
              <div style={{ textAlign: "center", }}>
                <IonButton color="medium" fill="outline" disabled={pollOptions.length >= 6} onClick={addPollAnswer} mode="ios">Add Option</IonButton>
                <IonButton fill="outline" color="danger" disabled={pollOptions.length <= 2} onClick={removePollAnswer} mode="ios">Remove Option</IonButton>
                <IonButton onClick={submitPoll} fill="outline" mode="ios">Submit</IonButton>
              </div>
              <br />
              <div style={{ textAlign: "center", }}>
                <IonCardSubtitle>Polls are up for 7 days</IonCardSubtitle>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={showModalComment}>
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
                  <IonButton onClick={() => {handleCommentSubmit(commentModalPost.key);}} style={{ height: "5vh", marginTop: "2%", width: "80vw", textAlign:"center" }} fill="outline" >Comment</IonButton>
                  </IonCol>
                  <IonCol></IonCol>
                </IonRow>
              </div>
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
                            commentModalPostIndex != -1 &&
                              topPosts &&
                              user &&
                              topPosts[commentModalPostIndex] &&
                              "data" in topPosts[commentModalPostIndex] &&
                              "likes" in topPosts[commentModalPostIndex].data &&
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
                              commentModalPostIndex,
                              commentModalPost.data
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
                            commentModalPostIndex != -1 &&
                              topPosts &&
                              user &&
                              topPosts[commentModalPostIndex] &&
                              "data" in topPosts[commentModalPostIndex] &&
                              "dislikes" in topPosts[commentModalPostIndex].data &&
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
                              commentModalPostIndex,
                              commentModalPost.data,
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
              <div style={{height: "25vh"}}>
                  <p style={{textAlign:"center"}}>&#183; </p> 
                </div>
            </div>
          </IonContent>
        </IonModal>

        {(polls && polls.length <= 0) && (topPosts && topPosts.length <= 0) && (topWeeklyPosts && topWeeklyPosts.length <= 0) ? (
          <>
            <IonSpinner className='ion-spinner' color="primary" />
          </>
        ) : (
          <>
            <FadeIn transitionDuration={500}>
              <IonHeader class="ion-no-border">
                <IonToolbar mode="ios">
                  <IonTitle>Polls</IonTitle>
                  <IonButton color="medium" fill="outline" size="small" onClick={() => { handleOpenPollModal(); }} slot="end">
                    <IonIcon icon={addCircleOutline} /> New Poll
                  </IonButton>
                </IonToolbar>
              </IonHeader>
              {user && polls && polls.length > 0 ? (
                <>
                  {yourPollsSelected ? (
                    <Swiper slidesPerView={1.25}>
                      {yourPolls.map((poll) => {
                        return (
                          <SwiperSlide key={poll.key}>
                            <IonCard mode='ios'>
                              <IonCardContent style={{ minHeight: "65vh" }}>
                                <p>{poll.userName}</p>
                                <IonCardTitle style={{ fontSize: "1.5em" }}>{poll.question}</IonCardTitle>
                                <br />
                                <IonList lines="full" mode="ios">
                                  {poll.options.map((option: any, index: number) => {
                                    return (
                                      <IonItem style={{ fontWeight: "bold" }} onClick={() => { handlePollVote(index, poll.key) }} disabled={poll.voteMap[user!.uid] !== undefined || voteBeingCasted} color={poll.voteMap[user!.uid] === index ? "primary" : ""} key={index} mode="ios" lines="full">
                                        {option.text} <p hidden={poll.voteMap[user!.uid] === undefined} slot="end">{Math.round(((poll.results[index] / poll.votes) * 100) * 10) / 10 + "%"}</p>
                                      </IonItem>
                                    )
                                  })}
                                </IonList>
                                <IonFab vertical="bottom" horizontal="start">
                                  <p>{poll.votes} Votes &#183; {getTimeLeft(poll.timestamp)} days left</p>
                                </IonFab>
                              </IonCardContent>
                            </IonCard>
                          </SwiperSlide>
                        )
                      })}
                    </Swiper>
                  ) : (
                    <Swiper slidesPerView={1.25}>
                      {polls.map((poll) => {
                        return (
                          <SwiperSlide key={poll.key}>
                            <IonCard mode='ios'>
                              <IonCardContent style={{ minHeight: "60vh" }}>
                                <p>{poll.userName}</p>
                                <IonCardTitle style={{ fontSize: "1.5em" }}>{
                                  poll.question}</IonCardTitle>
                                <br />
                                <IonList lines="full" mode="ios">
                                  {poll.options.map((option: any, index: number) => {
                                    return (
                                      <IonItem style={{ fontWeight: "bold" }} onClick={() => { handlePollVote(index, poll.key) }} disabled={poll.voteMap[user!.uid] !== undefined || voteBeingCasted} color={poll.voteMap[user!.uid] === index ? "primary" : ""} key={index} mode="ios" lines="full">
                                        <div style={{ width: "100%" }}>{option.text}</div> <p hidden={poll.voteMap[user!.uid] === undefined} slot="end">{Math.round(((poll.results[index] / poll.votes) * 100) * 10) / 10 + "%"}</p>
                                      </IonItem>
                                    )
                                  })}
                                </IonList>
                                <br />
                                <IonFab vertical="bottom" horizontal="start">
                                  <p>{poll.votes} Votes &#183; {getTimeLeft(poll.timestamp)} days left</p>
                                </IonFab>
                              </IonCardContent>
                            </IonCard>
                          </SwiperSlide>
                        )
                      })}
                    </Swiper>
                  )}
                </>
              ) : (null)}
            </FadeIn>
            <FadeIn transitionDuration={500}>
              <IonHeader class="ion-no-border">
                <IonToolbar mode="ios">
                  <IonTitle>Top Posts <br /> (All Time)</IonTitle>
                  <IonFab horizontal="end">
                    <IonIcon icon={chevronForward} />
                  </IonFab>
                  <IonFab horizontal="start">
                    <IonIcon icon={chevronBack} />
                  </IonFab>
                </IonToolbar>
              </IonHeader>
              <Swiper
                slidesPerView={1.5}
              >
                {topPosts && topPosts.length > 0
                  ? topPosts.map((post, index) => {
                    return (
                      <FadeIn>
                        <SwiperSlide key={post.key + "_allTime"}>
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
                                      handleUpVote(post.key, index, post.data);
                                    }}
                                    style={{ width: "16vw" }}
                                    mode="ios"
                                    fill="outline"
                                    color={
                                      index != -1 &&
                                        topPosts &&
                                        topPosts[index] &&
                                        "data" in topPosts[index] &&
                                        "likes" in topPosts[index].data &&
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
                                      handleDownVote(post.key, index, post.data);
                                    }}
                                    color={
                                      index != -1 &&
                                        topPosts &&
                                        topPosts[index] &&
                                        user &&
                                        "data" in topPosts[index] &&
                                        "dislikes" in topPosts[index].data &&
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
                      </FadeIn>
                    );
                  })
                  : null}
              </Swiper>
            </FadeIn>
            <FadeIn transitionDuration={500}>
              <IonToolbar mode="ios">
                <IonTitle>Top Posts <br /> (Week)</IonTitle>
                <IonFab horizontal="end">
                  <IonIcon icon={chevronForward} />
                </IonFab>
                <IonFab horizontal="start">
                  <IonIcon icon={chevronBack} />
                </IonFab>
              </IonToolbar>
              <Swiper slidesPerView={1.5}>
                {topWeeklyPosts && topWeeklyPosts.length > 0
                  ? topWeeklyPosts.map((post, index) => {
                    return (
                      <SwiperSlide key={post.key + "_weekly"}>
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
                                    handleUpVote(post.key, index, post.data);
                                  }}
                                  style={{ width: "16vw" }}
                                  mode="ios"
                                  fill="outline"
                                  color={
                                    index != -1 &&
                                      topPosts &&
                                      topPosts[index] &&
                                      "data" in topPosts[index] &&
                                      "likes" in topPosts[index].data &&
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
                                    handleDownVote(post.key, index, post.data);
                                  }}
                                  color={
                                    index != -1 &&
                                      topPosts &&
                                      topPosts[index] &&
                                      user &&
                                      "data" in topPosts[index] &&
                                      "dislikes" in topPosts[index].data &&
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
                  : <><FadeIn delay={1000}><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                    <div style={{ textAlign: "center" }}><p>NO POSTS WITHIN PAST WEEK</p></div>
                    <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></FadeIn></>}
              </Swiper>
            </FadeIn>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}

export default React.memo(Community);
