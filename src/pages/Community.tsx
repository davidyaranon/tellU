import {
  IonContent,
  IonHeader,
  IonCardTitle,
  IonCard,
  IonModal,
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
  IonText,
  IonGrid,
  IonRefresherContent,
  IonRefresher,
  RefresherEventDetail,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import {
  addCircleOutline,
  chevronBackOutline,
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { db, getPolls, getWeatherData, pollVote, submitPollFb } from "../fbconfig";
import {
  promiseTimeout,
} from "../fbconfig";
import { doc, onSnapshot } from "firebase/firestore";
import "../App.css";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { useSelector } from "react-redux";
import FadeIn from "react-fade-in";
import UIContext from '../my-context';
import tellU_Community from '../images/tellU_Community.png';
import tellU_Community_Dark from '../images/tellU_Community_Dark.png';
import { Keyboard } from "@capacitor/keyboard";
import feedback from '../images/feedback.png';
import { Navigation } from "swiper";
import clouds_96 from '../images/icons8-clouds-96.png';
import sun_96 from '../images/icons8-sun-96.png';
import partly_cloudy from '../images/icons8-partly-cloudy-day-96.png';
import sunny_rainy from '../images/icons8-rain-cloud-96.png';
import rainy from '../images/icons8-rain-96.png';
import stormy from '../images/icons8-storm-96.png';
import nighttime from '../images/icons8-moon-phase-96.png';
import "swiper/css";
import "swiper/css/pagination";

interface PollAnswer {
  text: string,
};

function Community() {
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const Toast = useToast();
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const history = useHistory();
  const [pollSubmitting, setPollSubmitting] = useState<boolean>(false);
  const [pollModalOpen, setPollModalOpen] = useState<boolean>(false);
  const [pollText, setPollText] = useState<string>("");
  const [weatherData, setWeatherData] = useState<any>();
  const [isDay, setIsDay] = useState<boolean>(false);
  const [voteBeingCasted, setVoteBeingCasted] = useState<boolean>(false);
  const [pollOptions, setPollOptions] = useState<PollAnswer[]>([
    { text: "", },
    { text: "", },
    { text: "", },
  ]); // start with three options, include more programatically
  const [polls, setPolls] = useState<any[]>([]);
  const { setShowTabs } = React.useContext(UIContext);

  const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (schoolName) {
        getWeatherData(schoolName).then((data: any) => {
          if (data && data.icon.toString().includes('day')) {
            setIsDay(true);
          } else {
            setIsDay(false);
          }
          setWeatherData(data);
        }).catch((err) => {
          console.log(err);
          Toast.error('Unable to load weather data');
        });
        const pollsLoaded = promiseTimeout(10000, getPolls(schoolName));
        pollsLoaded.then((res) => {
          setPolls(res);
        });
        pollsLoaded.catch((err) => {
          Toast.error(err + "\n Check your internet connection");
        });
        setTimeout(() => {
          event.detail.complete();
        }, 1000);
      }
      setBusy(false);
    }
  };

  useIonViewWillEnter(() => {
    setShowTabs(true);
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
    const unsub = onSnapshot(doc(db, "schoolWeather", schoolName.replace(/\s+/g, "")), (doc) => {
      const data = doc.data();
      if (data) {
        if (data.icon.includes('day')) {
          setIsDay(true);
        } else {
          setIsDay(false);
        }
      } else {
        Toast.error("Something went wrong when loading weather data");
      }
      setWeatherData(data);
    });
    return () => { unsub(); }
  }, [schoolName]);

  return (
    <IonPage>
      <IonContent>

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
                  <IonButtons style={{ marginLeft: "-2.5%" }}>
                    <IonButton
                      onClick={() => {
                        Keyboard.hide().then(() => {
                          setTimeout(() => setPollModalOpen(false), 100);
                        });
                        setPollText("");
                      }}
                    >
                      <IonIcon icon={chevronBackOutline}></IonIcon> Back
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
                <IonButton onClick={submitPoll} fill="clear" mode="ios">Submit</IonButton>
              </div>
              <br />
              <div style={{ textAlign: "center", }}>
                <IonCardSubtitle>*Polls are up for 4 days</IonCardSubtitle>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <FadeIn>
          <IonHeader mode='ios'>
            <div>
              <img draggable={false} src={darkModeToggled ? tellU_Community_Dark : tellU_Community} />
            </div>
          </IonHeader>
        </FadeIn>

        {
          !polls ? (
            <>
              <IonSpinner className='ion-spinner' color="primary" />
            </>
          ) : (
            <>
              <FadeIn>
                <hr style={{ width: "95%" }} />
              </FadeIn>
              {weatherData ? (
                <FadeIn>
                  <div>
                    <Swiper slidesPerView={2}
                      spaceBetween={-15}
                      loopFillGroupWithBlank={true}
                      modules={[Navigation]}
                      navigation={true}
                      loop={true}
                    >
                      <SwiperSlide>
                        <IonCard mode="ios" style={{
                          opacity: "100%",
                          minHeight: "30vh",
                          background: isDay ? "linear-gradient(180deg, rgba(46,80,153,1) 0%, rgba(47,146,209,1) 23%, rgba(0,212,255,1) 60%, rgba(0,211,255,1) 98%, rgba(156,238,255,1) 100%, rgba(20,93,149,1) 1232%)" :
                            "linear-gradient(180deg, rgba(0,8,22,1) 0%, rgba(0,4,56,1) 38%, rgba(47,63,105,1) 100%)"
                        }}>
                          <IonCardContent style={{ minHeight: "30vh" }}>
                            <IonFab horizontal="start" vertical="top">
                              <IonNote style={{ color: "white" }}>
                                {weatherData.location}
                              </IonNote>
                              <IonCardTitle style={{ color: "white" }}>{Math.round(weatherData.temp)}{'\u00b0'}</IonCardTitle>
                            </IonFab>
                            <IonFab horizontal="start" vertical="bottom">
                              <IonNote style={{ color: "white", fontSize: "0.90em" }}>
                                {weatherData.text}
                              </IonNote>
                              <p></p>
                              <IonNote style={{ color: "white", fontSize: "0.90em" }}>
                                Humidity: {weatherData.humidity}%
                              </IonNote>
                            </IonFab>
                            <IonFab horizontal="end" style={{ marginLeft: "20vw" }}>
                              {weatherData && weatherData.icon === '/day/113.png' &&
                                <img style={{ width: "70%", marginTop: "1vh" }} src={sun_96} />
                              }
                              {weatherData && weatherData.icon === '/day/116.png' &&
                                <img style={{ width: "70%", marginTop: "1vh" }} src={partly_cloudy} />
                              }
                              {weatherData && (weatherData.icon === '/day/119.png'
                                || weatherData.icon === '/day/122.png'
                                || weatherData.icon === '/day/143.png')
                                &&
                                <img style={{ width: "70%", marginTop: "1vh" }} src={clouds_96} />
                              }
                              {weatherData && (weatherData.icon === '/day/386.png'
                                || weatherData.icon === '/day/389.png'
                                || weatherData.icon === '/day/395.png'
                                || weatherData.icon === '/day/392.png')
                                &&
                                <img style={{ width: "70%", marginTop: "1vh" }} src={stormy} />
                              }
                              {weatherData && (weatherData.icon === '/day/176.png'
                                || weatherData.icon === '/day/293.png'
                                || weatherData.icon === '/day/299.png'
                                || weatherData.icon === '/day/305.png'
                                || weatherData.icon === '/day/323.png'
                                || weatherData.icon === '/day/329.png'
                                || weatherData.icon === '/day/335.png'
                                || weatherData.icon === '/day/353.png'
                                || weatherData.icon === '/day/356.png'
                                || weatherData.icon === '/day/359.png'
                                || weatherData.icon === '/day/362png'
                                || weatherData.icon === '/day/182.png')
                                &&
                                <img style={{ width: "70%", marginTop: "1vh" }} src={sunny_rainy} />
                              }
                              {weatherData && (weatherData.icon === '/day/185.png'
                                || weatherData.icon === '/day/263.png'
                                || weatherData.icon === '/day/281.png'
                                || weatherData.icon === '/day/296.png'
                                || weatherData.icon === '/day/308.png'
                                || weatherData.icon === '/day/314.png'
                                || weatherData.icon === '/day/318.png'
                                || weatherData.icon === '/day/320.png'
                                || weatherData.icon === '/day/311.png'
                                || weatherData.icon === '/day/302.png'
                                || weatherData.icon === '/day/284.png'
                                || weatherData.icon === '/day/266.png')
                                &&
                                <img style={{ width: "70%", marginTop: "1vh" }} src={rainy} />
                              }
                              {weatherData && weatherData.icon.toString().includes('night') && (
                                <>
                                  {weatherData.icon === '/night/113.png'
                                    || weatherData.icon === '/night/116.png'
                                    || weatherData.icon === '/night/119.png'
                                    || weatherData.icon === '/night/122.png'
                                    || weatherData.icon === '/night/143.png' ? (
                                    <img style={{ width: "50%", marginTop: "1vh" }} src={nighttime} />
                                  ) : (
                                    <img style={{ width: "70%", marginTop: "1vh" }} src={rainy} />

                                  )}
                                </>
                              )}
                            </IonFab>
                          </IonCardContent>
                        </IonCard>
                      </SwiperSlide>
                      <SwiperSlide>
                        <IonCard mode="ios" style={{
                          minHeight: "30vh",
                          background: 'linear-gradient(180deg, rgba(238,133,150,1) 0%, rgba(237,181,190,1) 98%)'
                        }} onClick={() => { history.push("https://docs.google.com/forms/d/e/1FAIpQLSfyEjG1AaZzfvh3HsEqfbQN6DtgCp_zKfWsNzTh94R-3paDwg/viewform?usp=sf_link") }}>
                          <IonCardContent style={{ minHeight: "30vh" }}>
                            <IonFab horizontal="start" vertical="top">
                              <IonCardTitle style={{ fontSize: "1.25em" }}>
                                Feedback
                              </IonCardTitle>
                            </IonFab>
                            <div><br /></div>
                            <div>
                              <IonGrid >
                                <IonRow class="ion-align-items-center">
                                  <IonCol></IonCol>
                                </IonRow>
                                <IonRow class="ion-align-items-center">
                                  <IonCol>
                                    <img src={feedback} />
                                  </IonCol>
                                </IonRow >
                                <IonRow class="ion-align-items-center">
                                  <IonCol></IonCol>
                                </IonRow>
                              </IonGrid>
                            </div>
                            <IonFab horizontal="start" vertical="bottom">
                              <p style={{ color: darkModeToggled ? "white" : "black" }}>Let us know what you think of the app</p>
                            </IonFab>
                          </IonCardContent>
                        </IonCard>
                      </SwiperSlide>
                      {/* <SwiperSlide>
                        <IonCard mode="ios" style={{
                          minHeight: "30vh",
                          background: "linear-gradient(135deg, #7158fe, #9d4de6"
                          // background: !darkModeToggled ? 'linear-gradient(180deg, rgba(184,182,182,1) 0%, rgba(207,207,207,1) 20%, rgba(236,236,236,1) 100%)' : 'linear-gradient(180deg, rgba(47,47,47,1) 0%, rgba(59,59,59,1) 20%, rgba(92,92,92,1) 100%)'
                        }}>
                          <IonCardContent style={{ minHeight: "30vh" }}>
                            <IonFab vertical="top" horizontal="start">
                              {/* <IonCardTitle style={{ color: "white" }}>Coupon</IonCardTitle>
                            </IonFab>
                            <img style={{ marginTop: "32.5%" }} src={taco_bell} />
                            <IonFab vertical="bottom" style={{ width: "70vw", fontSize: "0.85em", color: "white", alignText: "center" }}>

                            </IonFab>
                          </IonCardContent>
                        </IonCard>
                      </SwiperSlide>
                      <SwiperSlide>
                        <IonCard mode="ios" style={{
                          minHeight: "30vh",
                          background: "#2f3844"
                        }}
                        >
                          <IonCardContent style={{ minHeight: "30vh", alignItems: "center", }}>
                            <img style={{ marginTop: "65%" }} src={amazon} />
                          </IonCardContent>
                        </IonCard>
                      </SwiperSlide> */}
                    </Swiper>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn transitionDuration={500}>
                  <Swiper slidesPerView={2} spaceBetween={-15} loopFillGroupWithBlank={true} modules={[Navigation]} navigation={true} loop={true}>
                    <SwiperSlide>
                      <IonCard mode="ios" style={{
                        opacity: "100%",
                        minHeight: "30vh",
                        background: "linear-gradient(180deg, rgba(46,80,153,1) 0%, rgba(47,146,209,1) 23%, rgba(0,212,255,1) 60%, rgba(0,211,255,1) 98%, rgba(156,238,255,1) 100%, rgba(20,93,149,1) 1232%)"
                      }}>
                        <IonCardContent style={{ minHeight: "30vh" }}>
                          <IonFab horizontal="start" vertical="top">
                            <IonNote style={{ color: "white" }}>
                              {/* {weatherData.location} */}
                            </IonNote>
                            <IonCardTitle style={{ color: "white" }}>
                              {/* {weatherData.temp}{'\u00b0'} */}
                            </IonCardTitle>
                          </IonFab>
                          <IonFab horizontal="start" vertical="bottom">
                            <IonNote style={{ color: "white", fontSize: "0.90em" }}>
                              {/* {weatherData.text} */}
                            </IonNote>
                            <p></p>
                            <IonNote style={{ color: "white", fontSize: "0.90em" }}>
                              {/* Humidity: {weatherData.humidity}% */}
                            </IonNote>
                          </IonFab>
                        </IonCardContent>
                      </IonCard>
                    </SwiperSlide>
                    <SwiperSlide>
                      <IonCard mode="ios" style={{ minHeight: "30vh" }} onClick={() => { history.push("https://docs.google.com/forms/d/e/1FAIpQLSfyEjG1AaZzfvh3HsEqfbQN6DtgCp_zKfWsNzTh94R-3paDwg/viewform?usp=sf_link") }}>
                        <IonCardContent style={{ minHeight: "30vh" }}>
                          <IonFab horizontal="start" vertical="top">
                            <IonCardTitle>
                              <IonText color='medium'>
                                {/* Feedback */}
                              </IonText>
                            </IonCardTitle>
                          </IonFab>
                          <div><br /></div>
                          <div>
                            <IonGrid >
                              <IonRow class="ion-align-items-center">
                                <IonCol></IonCol>
                              </IonRow>
                              <IonRow class="ion-align-items-center">
                                <IonCol>
                                  {/* <IonImg src={feedback} /> */}
                                </IonCol>
                              </IonRow >
                              <IonRow class="ion-align-items-center">
                                <IonCol></IonCol>
                              </IonRow>
                            </IonGrid>
                          </div>
                          <IonFab horizontal="start" vertical="bottom">
                            {/* <p>Let us know what you think of the app</p> */}
                          </IonFab>
                        </IonCardContent>
                      </IonCard>
                    </SwiperSlide>
                  </Swiper>
                </FadeIn>
              )}
              <FadeIn>
                <hr style={{ width: "95%" }} />
              </FadeIn>
              <FadeIn transitionDuration={500}>
                {/* <IonHeader class="ion-no-border"> */}
                <IonToolbar mode="ios">
                  {/* <p style={{fontWeight:"bold" ,fontSize: "1em", marginLeft: "5vw"}}>Polls</p>
                   */}
                  <IonCardTitle style={{ marginLeft: "5%", fontSize: "1.5em" }}>Polls</IonCardTitle>
                  <IonButton style={{ marginRight: "3%" }} color="medium" fill="outline" size="small" onClick={() => { handleOpenPollModal(); }} slot="end">
                    <IonIcon icon={addCircleOutline} /> {'\u00A0'}New Poll
                  </IonButton>
                </IonToolbar>
                {/* </IonHeader> */}

                {user && polls && polls.length > 0 ? (
                  <>
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
                                      <IonItem style={{ fontWeight: "bold", fontSize: "0.95em" }} onClick={() => { handlePollVote(index, poll.key) }} disabled={poll.voteMap[user!.uid] !== undefined || voteBeingCasted} color={poll.voteMap[user!.uid] === index ? "primary" : ""} key={index} mode="ios" lines="full">
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
                  </>
                ) : <><FadeIn><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                  <div style={{ textAlign: "center" }}><p>No polls within past week</p></div>
                  <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></FadeIn></>}
              </FadeIn>
            </>
          )
        }
      </IonContent >
    </IonPage >
  );
}

export default React.memo(Community);

// const epaStandards: string[] = [
//   '',
//   'Good',
//   'Moderate',
//   'Unhealthy for Sensitive Groups',
//   'Unhealthy',
//   'Very Unhealthy',
//   'Hazardous'
// ];

// const epaStandardsDescription: string[] = [
//   '',
//   'The air quality is ideal for most individuals; enjoy your normal outdoor activities.',
//   'The air quality is generally acceptable for most individuals. However, sensitive groups may experience minor to moderate symptoms from long-term exposure.',
//   'The air has reached a high level of pollution and is unhealthy for sensitive groups. Reduce time spent outside if you are feeling symptoms such as difficulty breathing or throat irritation.',
//   'Health effects can be immediately felt by sensitive groups. Healthy individuals may experience difficulty breathing and throat irritation with prolonged exposure. Limit outdoor activity.',
//   'Health effects will be immediately felt by sensitive groups and should avoid outdoor activity. Healthy individuals are likely to experience difficulty breathing and throat irritation; consider staying indoors and rescheduling outdoor activities.',
//   'Any exposure to the air, even for a few minutes, can lead to serious health effects on everybody. Avoid outdoor activities.',
// ]