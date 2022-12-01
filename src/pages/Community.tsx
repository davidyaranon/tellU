import {
  IonContent, IonHeader, IonCardTitle, IonCard,
  IonModal, IonList, IonItem, IonLoading,
  IonNote, IonButton, IonIcon, IonFab, IonToolbar, IonTitle,
  IonButtons, IonCardContent, IonRow, IonCol, IonSpinner,
  IonPage, useIonViewWillEnter, IonInput, IonCardSubtitle,
  IonGrid, IonRefresherContent, IonRefresher, RefresherEventDetail,
  IonImg,
} from "@ionic/react";
import { useEffect, useState } from "react";
import TellUHeader, { ionHeaderStyle } from "./Header";
import {
  addCircleOutline,
  chevronBackOutline,
} from "ionicons/icons";
import humboldtImage from '../images/humboldt_school.jpeg'
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getNewsArticles, getPolls, pollVote, submitPollFb } from "../fbconfig";
import {
  promiseTimeout,
} from "../fbconfig";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { useSelector } from "react-redux";
import FadeIn from "react-fade-in";
import { Keyboard } from "@capacitor/keyboard";
import humboldt_trees from '../images/humboldt_trees.png';
import "../App.css";
import "swiper/css";
import 'react-circular-progressbar/dist/styles.css';
import TimeAgo from "javascript-time-ago";
import { useTabsContext } from "../my-context";

interface PollAnswer {
  text: string,
};

function Community() {
  const Toast = useToast();
  const history = useHistory();
  const [user] = useAuthState(auth);
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const tabs = useTabsContext();
  const timeAgo = new TimeAgo("en-US");

  const [busy, setBusy] = useState<boolean>(false);
  const [pollSubmitting, setPollSubmitting] = useState<boolean>(false);
  const [pollModalOpen, setPollModalOpen] = useState<boolean>(false);
  const [pollText, setPollText] = useState<string>("");
  const [voteBeingCasted, setVoteBeingCasted] = useState<boolean>(false);
  const [pollOptions, setPollOptions] =
    useState<PollAnswer[]>([
      { text: "", },
      { text: "", },
      { text: "", },
    ]); // start with three options, include more programatically
  const [polls, setPolls] = useState<any[]>([]);
  const [articles, setArticles] = useState<any>();

  const getDate = (timestamp: any) => {
    if (!timestamp) {
      return '';
    }
    const time = new Date(timestamp);
    // console.log(timeAgo.format(time));
    return timeAgo.format(time);
  };

  const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setBusy(true);
    if (!user) {
      history.replace("/register");
    } else {
      if (schoolName) {
        getNewsArticles(schoolName).then((res) => {
          setArticles(res);
        })
        const pollsLoaded = promiseTimeout(10000, getPolls(schoolName));
        pollsLoaded.then((res) => {
          setPolls(res);
        });
        pollsLoaded.catch((err) => {
          Toast.error(err + "\n Check your internet connection");
        });
        setTimeout(() => {
          event.detail.complete();
        }, 250);
      }
      setBusy(false);
    }
  };

  useIonViewWillEnter(() => {
    tabs.setShowTabs(true);
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (schoolName) {
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
    return () => { }
  }, [user, schoolName]);

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
    const pollSubmitted = promiseTimeout(10000, submitPollFb(pollText, pollOptions, schoolName, user.displayName, user.uid));
    pollSubmitted.then((res) => {
      if (res) {
        const pollsLoaded = promiseTimeout(10000, getPolls(schoolName));
        pollsLoaded.then((res) => {
          setPolls(res);
          Toast.success("Poll submitted");
          setPollModalOpen(false);
        });
        pollsLoaded.catch((err) => {
          Toast.error(err + "\n Check your internet connection");
        });
      } else {
        Toast.error("Something went wrong when submitting poll, please try again");
      }
      setPollSubmitting(false);
      Keyboard.hide().then(() => {
        setPollText('');
        setTimeout(() => setPollModalOpen(false), 100);
      });
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
    return (4 - (Math.floor(ms / (1000 * 60 * 60 * 24)))) > 0 ? (4 - (Math.floor(ms / (1000 * 60 * 60 * 24)))).toString() : '0';
  }

  const handlePollVote = async (index: number, pollKey: string) => {
    if (user && schoolName) {
      setVoteBeingCasted(true);
      const castedVote = promiseTimeout(5000, pollVote(schoolName, index, pollKey, user.uid));
      castedVote.then((res) => {
        if (res) {
          Toast.success("Vote cast!");
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

  useEffect(() => {
    getNewsArticles(schoolName).then((res) => {
      if (res) {
        if (res.schoolArticles) {
          res.schoolArticles.sort(function (a: any, b: any) {
            var keyA = new Date(a.date), keyB = new Date(b.date);
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          });
        }
        if (res.localArticles) {
          res.localArticles.sort(function (a: any, b: any) {
            var keyA = new Date(a.date), keyB = new Date(b.date);
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          });
        }
        setArticles(res);
      }
    });
    // const unsub = onSnapshot(doc(db, "schoolWeather", schoolName.replace(/\s+/g, "")), (doc) => {
    //   const data = doc.data();
    //   if (data) {
    //     if (data.icon.includes('day')) {
    //       setIsDay(true);
    //     } else {
    //       setIsDay(false);
    //     }
    //   } else {
    //     Toast.error("Something went wrong when loading weather data");
    //   }
    //   setWeatherData(data);
    // });
    return () => { }
  }, [schoolName]);

  return (
    <IonPage className="ion-page-ios-notch">
      <IonContent>

        <FadeIn transitionDuration={1500}>
          <IonHeader class="ion-no-border" style={ionHeaderStyle} >
            <TellUHeader darkMode={darkModeToggled} colorPallete={schoolColorToggled} schoolName={schoolName} zoom={1} />
          </IonHeader>
        </FadeIn>

        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent
            pullingText="Pull to refresh"
            refreshingSpinner="crescent"
            refreshingText="Refreshing..."
          ></IonRefresherContent>
        </IonRefresher>

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

        <IonModal backdropDismiss={false} isOpen={pollModalOpen} swipeToClose={false} handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
          <IonContent>
            <div>
              <div style={{ width: "100%" }}>
                <IonToolbar mode="ios">
                  <IonButtons style={{ marginLeft: "-2.5%" }}>
                    <IonButton
                      color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                      onClick={() => {
                        Keyboard.hide().then(() => {
                          setTimeout(() => setPollModalOpen(false), 100);
                        }).catch((err) => {
                          setTimeout(() => setPollModalOpen(false), 100);
                        });
                        setPollText("");
                      }}
                    >
                      Back
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </div>
              <IonHeader mode="ios">
                <IonTitle>Poll</IonTitle>
                <br />
              </IonHeader>
              <IonInput
                autoCorrect="on"
                type="text"
                style={{ width: "90vw", left: "5vw", fontWeight: "bold" }}
                maxlength={100}
                value={pollText}
                placeholder="Ask a question*"
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
                <IonButton color="medium" fill="clear" disabled={pollOptions.length >= 6} onClick={addPollAnswer} mode="ios">Add Option</IonButton>
                <IonButton fill="clear" color="danger" disabled={pollOptions.length <= 2} onClick={removePollAnswer} mode="ios">Remove Option</IonButton>
                <IonButton color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} onClick={submitPoll} fill="clear" mode="ios">Submit</IonButton>
              </div>
              <br />
              <div style={{ textAlign: "center", }}>
                <IonCardSubtitle>*Polls are up for 4 days</IonCardSubtitle>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <IonToolbar mode="ios">
          {/* <p style={{fontWeight:"bold" ,fontSize: "1em", marginLeft: "5vw"}}>Polls</p>
                   */}
          <IonCardTitle style={{ marginLeft: "5%", fontSize: "1.5em" }}>Polls</IonCardTitle>
          <IonButton style={{ marginRight: "3%" }} color="medium" fill="outline" size="small" onClick={() => { handleOpenPollModal(); }} slot="end">
            <IonIcon icon={addCircleOutline} /> {'\u00A0'}New Poll
          </IonButton>
        </IonToolbar>
        {user && polls && polls.length > 0 ? (
          <FadeIn>
            <Swiper slidesPerView={1.1} spaceBetween={-15}>
              {polls.map((poll) => {
                return (
                  <SwiperSlide key={poll.key}>
                    <IonCard mode='ios'>
                      <IonCardContent style={{ minHeight: "50vh" }}>
                        <p style={{ fontSize: "1em" }}>{poll.userName}</p>
                        <IonCardTitle style={{ fontSize: "1.35em", width: "95%", marginLeft: "0%" }}>{
                          poll.question}</IonCardTitle>
                        <br />
                        <IonList lines="full" mode="ios">
                          {poll.options.map((option: any, index: number) => {
                            return (
                              <IonItem style={{ fontWeight: "bold", fontSize: "0.95em" }} onClick={() => { handlePollVote(index, poll.key) }} disabled={poll.voteMap[user!.uid] !== undefined || voteBeingCasted} color={poll.voteMap[user!.uid] === index && schoolName !== "Cal Poly Humboldt" ? "primary" : poll.voteMap[user!.uid] === index && schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : poll.voteMap[user!.uid] === index && schoolName === "Cal Poly Humboldt" && !schoolColorToggled ? "primary" : ""} key={index} mode="ios" lines="full">
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
          </FadeIn>
        ) : <><FadeIn><br /><br /><br /><br /><br /><br />
          <div style={{ textAlign: "center", fontSize: "01em" }}><p>No polls within past week</p></div>
          <br /><br /><br /><br /><br /><br /></FadeIn></>}

        {
          !polls ? (
            <>
              <IonSpinner className='ion-spinner' color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} />
            </>
          ) : (
            <>
              <FadeIn transitionDuration={500}>
                <hr style={{ width: "95%" }} />
                <IonRow>
                  <IonCardTitle style={{ marginLeft: "5%", fontSize: "1.5em" }}>
                    Local News
                  </IonCardTitle>
                  <IonImg style={{ width: "1.5em" }} src={humboldt_trees} />
                </IonRow>
                {articles && "schoolArticles" in articles && articles.schoolArticles && Object.keys(articles).length > 0 ? (
                  <>
                    {articles.schoolArticles.map((article: any, index: number) => {
                      return (
                        // <>
                        <IonCard key={`article_` + index} mode="ios" style={{ height: "10vh" }}
                          onClick={() => {
                            if ("url" in article && article.url.length > 0) {
                              window.open(article.url);
                            }
                          }}>
                          <IonCardContent style={{ width: "100vw", height: "10%" }}>
                            <IonGrid>
                              <IonRow style={{ height: "10%" }}>
                                <IonFab vertical="center" horizontal="start">
                                  <IonCol style={{ right: "15%" }}>
                                    {article && "image" in article && article.image.length > 0 ?
                                      <img style={{ borderRadius: "15px" }} src={article.image} />
                                      :
                                      <img style={{ borderRadius: "15px", width: "100px", height: "100px" }} src={humboldtImage} />
                                    }
                                  </IonCol>
                                </IonFab>
                                <IonCol size="3"></IonCol>
                                <IonCol style={{ top: "-3vh" }} size="9">
                                  <IonRow>
                                    {article.title.length > 50 ?
                                      <p>{article.title.substring(0, 50) + '...'}</p>
                                      : <p>{article.title}</p>
                                    }
                                  </IonRow>
                                  <IonRow>
                                    <IonNote style={{ fontSize: "0.75em" }}>{getDate(article.date)}</IonNote>
                                  </IonRow>
                                </IonCol>
                              </IonRow>
                            </IonGrid>
                          </IonCardContent>
                        </IonCard>
                        // </>
                      )
                    })}
                  </>
                ) : (
                  <>
                    <p style={{ textAlign: "center" }}>Unable to load news</p>
                  </>
                )}

                {articles && "localArticles" in articles && articles.localArticles && Object.keys(articles).length > 0 ? (
                  <>
                    {articles.localArticles.map((article: any, index: number) => {
                      return (
                        // <>
                        <IonCard key={`article_` + index} mode="ios" style={{ height: "10vh" }}
                          onClick={() => {
                            if ("url" in article && article.url.length > 0) {
                              window.open(article.url);
                            }
                          }}>
                          <IonCardContent style={{ width: "100vw", height: "10%" }}>
                            <IonGrid>
                              <IonRow style={{ height: "10%" }}>
                                <IonFab vertical="center" horizontal="start">
                                  <IonCol style={{ right: "15%" }}>
                                    {article && "image" in article && article.image.length > 0 ?
                                      <img style={{ borderRadius: "15px", width: "100px", height: "100px" }} src={article.image} />
                                      :
                                      <img style={{ borderRadius: "15px", width: "100px", height: "100px" }} src={humboldtImage} />
                                    }
                                  </IonCol>
                                </IonFab>
                                <IonCol size="3"></IonCol>
                                <IonCol style={{ top: "-3vh" }} size="9">
                                  <IonRow>
                                    {article.title.length > 50 ?
                                      <p>{article.title.substring(0, 50) + '...'}</p>
                                      : <p>{article.title}</p>
                                    }
                                  </IonRow>
                                  <IonRow>
                                    <IonNote style={{ fontSize: "0.75em" }}>{getDate(article.date)}</IonNote>
                                  </IonRow>
                                </IonCol>
                              </IonRow>
                            </IonGrid>
                          </IonCardContent>
                        </IonCard>
                        // </>
                      )
                    })}
                  </>
                ) : (
                  <>
                  </>
                )}

                <FadeIn>
                  <hr style={{ width: "95%" }} />
                </FadeIn>
              </FadeIn>
            </>
          )
        }
      </IonContent >
    </IonPage >
  );
}

export default Community;