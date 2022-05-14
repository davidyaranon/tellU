import {
  IonContent,
  IonHeader,
  IonCardTitle,
  IonCard,
  IonModal,
  IonImg,
  IonList,
  IonItem,
  IonLoading,
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
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getPolls, getTopWeeklyPosts, pollVote,  submitPollFb } from "../fbconfig";
import {
  downVote,
  getTopPostsWithinPastDay,
  promiseTimeout,
  upVote,
} from "../fbconfig";
import "../App.css";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/pagination";
import FadeIn from "react-fade-in";
import { getColor, timeout } from '../components/functions';
import UIContext from '../my-context';

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
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [topWeeklyPosts, setTopWeeklyPosts] = useState<any[]>([]);
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const history = useHistory();
  const [pollSubmitting, setPollSubmitting] = useState<boolean>(false);
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
  const { setShowTabs } = React.useContext(UIContext);

  useIonViewWillEnter(() => {
    setShowTabs(true);
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

  const handleUpVote = async (postKey: string, index: number, post: any) => {
    const val = await upVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (topPosts && user) {
        let tempPosts: any[] = [...topPosts];
        tempPosts[index].data.upVotes += val;
        if (tempPosts[index].data.likes[user.uid]) {
          delete tempPosts[index].data.likes[user.uid];
        } else {
          if (tempPosts[index].data.dislikes[user.uid]) {
            delete tempPosts[index].data.dislikes[user.uid];
            tempPosts[index].data.downVotes -= 1;
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
        tempPosts[index].data.downVotes += val;
        if (tempPosts[index].data.dislikes[user.uid]) {
          delete tempPosts[index].data.dislikes[user.uid];
        } else {
          if (tempPosts[index].data.likes[user.uid]) {
            delete tempPosts[index].data.likes[user.uid];
            tempPosts[index].data.upVotes -= 1;
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

  const handleOpenPollModal = () => {
    setPollModalOpen(true);
  }

  const handlePollTextChange = (e: any) => {
    let currComment = e.detail.value;
    setPollText(currComment);
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
            <div>
              <div style={{ width: "100%" }}>
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
              </div>
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

        {(polls && polls.length <= 0) && (topPosts && topPosts.length <= 0) && (topWeeklyPosts && topWeeklyPosts.length <= 0) ? (
          <>
            <IonSpinner className='ion-spinner' color="primary" />
          </>
        ) : (
          <>
            <FadeIn transitionDuration={500}>
              {/* <IonHeader class="ion-no-border"> */}
              <IonToolbar mode="ios">
                <IonTitle>Polls</IonTitle>
                <IonButton color="medium" fill="outline" size="small" onClick={() => { handleOpenPollModal(); }} slot="end">
                  <IonIcon icon={addCircleOutline} /> New Poll
                </IonButton>
              </IonToolbar>
              {/* </IonHeader> */}
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
              ) : <><FadeIn delay={1000}><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                <div style={{ textAlign: "center" }}><p>NO POLLS WITHIN PAST WEEK</p></div>
                <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></FadeIn></>}
            </FadeIn>
            <FadeIn transitionDuration={500}>
              {/* <IonHeader class="ion-no-border"> */}
              <IonToolbar mode="ios">
                <IonTitle>Top Posts <br /> (All Time)</IonTitle>
                {/* <IonFab horizontal="end">
                  <IonIcon icon={chevronForward} />
                </IonFab>
                <IonFab horizontal="start">
                  <IonIcon icon={chevronBack} />
                </IonFab> */}
              </IonToolbar>
              {/* </IonHeader> */}
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
                                history.push("home/post/" + post.key);
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
                                    <p>{Object.keys(post.data.likes).length} </p>
                                  </IonButton>
                                </IonCol>
                                <IonCol size="4">
                                  <IonButton
                                    onClick={() => {
                                      // handleCardClick(post, index);
                                      history.push("home/post/" + post.key);
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
                                    <p>{Object.keys(post.data.dislikes).length} </p>
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
                {/* <IonFab horizontal="end">
                  <IonIcon icon={chevronForward} />
                </IonFab>
                <IonFab horizontal="start">
                  <IonIcon icon={chevronBack} />
                </IonFab> */}
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
                              // handleCardClick(post, index);
                              history.push("home/post/" + post.key);
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
                                  <p>{Object.keys(post.data.likes).length} </p>
                                </IonButton>
                              </IonCol>
                              <IonCol size="4">
                                <IonButton
                                  onClick={() => {
                                    // handleCardClick(post, index);
                                    history.push("home/post/" + post.key);
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
                                  <p>{Object.keys(post.data.dislikes).length} </p>
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
