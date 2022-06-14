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
  IonText,
  IonGrid,
  IonRefresherContent,
  IonRefresher,
  RefresherEventDetail,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
// import ForumIcon from "@mui/icons-material/Forum";
import {
  addCircleOutline,
  arrowBack,
  chevronDownCircleOutline,
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getLikes, getPolls, getTopWeeklyPosts, getWeatherData, pollVote, submitPollFb } from "../fbconfig";
import {
  downVote,
  getTopPostsWithinPastDay,
  promiseTimeout,
  upVote,
} from "../fbconfig";
// import {
//   Camera,
//   CameraResultType,
//   CameraSource,
//   Photo,
// } from "@capacitor/camera";
import "../App.css";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { useSelector } from "react-redux";
import FadeIn from "react-fade-in";
// import { getColor, timeout } from '../components/functions';
import UIContext from '../my-context';
import tellU_Community from '../images/tellU_Community.png';
import tellU_Community_Dark from '../images/tellU_Community_Dark.png';
import { Keyboard } from "@capacitor/keyboard";
import feedback from '../images/feedback.png';
import { Navigation, Pagination } from "swiper";
import clouds_96 from '../images/icons8-clouds-96.png';
import sun_96 from '../images/icons8-sun-96.png';
import partly_cloudy from '../images/icons8-partly-cloudy-day-96.png';
import sunny_rainy from '../images/icons8-rain-cloud-96.png';
import rainy from '../images/icons8-rain-96.png';
import stormy from '../images/icons8-storm-96.png';
import nighttime from '../images/icons8-moon-phase-96.png';
import amazon from '../images/amazon.png';
import taco_bell from '../images/taco_bell.svg';
import "swiper/css";
import "swiper/css/pagination";

interface PollAnswer {
  text: string,
};

function Community() {
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const Toast = useToast();
  // const [topPosts, setTopPosts] = useState<any[]>([]);
  // const [topWeeklyPosts, setTopWeeklyPosts] = useState<any[]>([]);
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
  // const [flip, setFlip] = useState<boolean>(false);
  // const [photo, setPhoto] = useState<Photo | null>();
  const [pollOptions, setPollOptions] = useState<PollAnswer[]>([
    { text: "", },
    { text: "", },
    { text: "", },
  ]); // start with three options, include more programatically
  const [polls, setPolls] = useState<any[]>([]);
  // const [showcase, setShowcase] = useState<any[]>([]);
  const [yourPollsSelected, setYourPollsSelected] = useState<boolean>(false);
  const [yourPolls, setYourPolls] = useState<any[]>([]);
  const { setShowTabs } = React.useContext(UIContext);
  // const [showcaseModal, setShowcaseModal] = useState<boolean>(false);
  // const [showcaseText, setShowcaseText] = useState<string>("");
  // const [blob, setBlob] = useState<any | null>(null);

  // async function takePicture() {
  //   try {
  //     const image = await Camera.getPhoto({
  //       quality: 90,
  //       allowEditing: false,
  //       source: CameraSource.Prompt,
  //       resultType: CameraResultType.Uri,
  //     });
  //     const res = await fetch(image.webPath!);
  //     const blobRes = await res.blob();
  //     if (blobRes) {
  //       if (blobRes.size > 5_000_000) {
  //         // 5MB
  //         Toast.error("Image too large");
  //       } else {
  //         setBlob(blobRes);
  //         setPhoto(image);
  //       }
  //     }
  //   } catch (err: any) {

  //   }
  // }

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
      }
      setBusy(false);
    }
  }, [user, schoolName]);

  // const handleUpVote = async (postKey: string, index: number, post: any) => {
  //   const val = await upVote(postKey, post);
  //   if (val && (val === 1 || val === -1)) {
  //     if (topPosts && user) {
  //       let tempPosts: any[] = [...topPosts];
  //       tempPosts[index].data.upVotes += val;
  //       if (tempPosts[index].data.likes[user.uid]) {
  //         delete tempPosts[index].data.likes[user.uid];
  //       } else {
  //         if (tempPosts[index].data.dislikes[user.uid]) {
  //           delete tempPosts[index].data.dislikes[user.uid];
  //           tempPosts[index].data.downVotes -= 1;
  //         }
  //         tempPosts[index].data.likes[user.uid] = true;
  //       }
  //       setTopPosts(tempPosts);
  //       await timeout(1000).then(() => {
  //         setDisabledLikeButtons(-1);
  //       });
  //     }
  //   } else {
  //     Toast.error("Unable to like post :(");
  //   }
  // };

  // const handleDownVote = async (postKey: string, index: number, post: any) => {
  //   const val = await downVote(postKey);
  //   if (val && (val === 1 || val === -1)) {
  //     if (topPosts && user) {
  //       let tempPosts: any[] = [...topPosts];
  //       tempPosts[index].data.downVotes += val;
  //       if (tempPosts[index].data.dislikes[user.uid]) {
  //         delete tempPosts[index].data.dislikes[user.uid];
  //       } else {
  //         if (tempPosts[index].data.likes[user.uid]) {
  //           delete tempPosts[index].data.likes[user.uid];
  //           tempPosts[index].data.upVotes -= 1;
  //         }
  //         tempPosts[index].data.dislikes[user.uid] = true;
  //       }
  //       setTopPosts(tempPosts);
  //       await timeout(1000).then(() => {
  //         setDisabledLikeButtons(-1);
  //       });
  //     }
  //   } else {
  //     Toast.error("Unable to dislike post :(");
  //   }
  // };

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
    if (schoolName) {
      getWeatherData(schoolName).then((data: any) => {
        if (data && data.icon.toString().includes('day')) {
          setIsDay(true);
        }
        setWeatherData(data);
      }).catch((err) => {
        console.log(err);
        Toast.error('Unable to load weather data');
      });
    }
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
                  <IonButtons slot="start">
                    <IonButton
                      onClick={() => {
                        Keyboard.hide().then(() => {
                          setTimeout(() => setPollModalOpen(false), 100);
                        });
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
                                <img style={{ width: "70%" }} src={sun_96} />
                              }
                              {weatherData && weatherData.icon === '/day/116.png' &&
                                <img style={{ width: "70%" }} src={partly_cloudy} />
                              }
                              {weatherData && (weatherData.icon === '/day/119.png'
                                || weatherData.icon === '/day/122.png'
                                || weatherData.icon === '/day/143.png')
                                &&
                                <img style={{ width: "70%" }} src={clouds_96} />
                              }
                              {weatherData && (weatherData.icon === '/day/386.png'
                                || weatherData.icon === '/day/389.png'
                                || weatherData.icon === '/day/395.png'
                                || weatherData.icon === '/day/392.png')
                                &&
                                <img style={{ width: "70%" }} src={stormy} />
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
                                <img style={{ width: "70%" }} src={sunny_rainy} />
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
                                <img style={{ width: "70%" }} src={rainy} />
                              }
                              {weatherData && weatherData.icon.toString().includes('night') && (
                                <>
                                  {weatherData.icon === '/night/113.png'
                                    || weatherData.icon === '/night/116.png'
                                    || weatherData.icon === '/night/119.png'
                                    || weatherData.icon === '/night/122.png'
                                    || weatherData.icon === '/night/143.png' ? (
                                    <img style={{ width: "50%", marginTop: "1.5vh" }} src={nighttime} />
                                  ) : (
                                    <img style={{ width: "70%" }} src={rainy} />

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
                    {yourPollsSelected ? (
                      <Swiper slidesPerView={1.25}>
                        {yourPolls.map((poll) => {
                          return (
                            <SwiperSlide key={poll.key}>
                              <IonCard mode='ios'>
                                <IonCardContent style={{ minHeight: "65vh" }}>
                                  <p>{poll.userName}</p>
                                  <IonCardTitle style={{ fontSize: "1.25em" }}>{poll.question}</IonCardTitle>
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
                    )}
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
  // async function sendImage(blob: any, uniqueId: string) {
  //   const res = await uploadImage("images", blob, uniqueId);
  //   if (res == false || photo == null || photo?.webPath == null) {
  //     Toast.error("unable to select photo");
  //   } else {
  //     // Toast.success("photo uploaded successfully");
  //   }
  // }

  // const postShowcase = async () => {
  //   if (showcaseText.trim().length == 0 && !blob && !photo) {
  //     Toast.error("Input a message!");
  //     return;
  //   }
  //   setShowcaseModal(false);
  //   setShowcaseText('');
  //   let uniqueId = uuidv4();
  //   if (blob) {
  //     await sendImage(blob, uniqueId.toString());
  //     setBlob(null);
  //     setPhoto(null);
  //   }
  //   const res = await submitShowcase(schoolName, blob, uniqueId.toString(), showcaseText);
  //   if (res) {
  //     Toast.success("Uploaded!");
  //     const showcaseLoaded = promiseTimeout(10000, getShowcase(schoolName));
  //     showcaseLoaded.then((res) => {
  //       setShowcase(res);
  //     });
  //     showcaseLoaded.catch((err) => {
  //       console.log(err + '\nCheck your internet connection');
  //     });
  //   }
  // }

{/* <IonModal backdropDismiss={false} isOpen={showcaseModal}>
          <IonContent>
            <div>
              <div style={{ width: "100%" }}>
                <IonToolbar mode="ios">
                  <IonButtons slot="start">
                    <IonButton
                      onClick={() => {
                        setShowcaseModal(false);
                        setShowcaseText("");
                      }}
                    >
                      <IonIcon icon={arrowBack}></IonIcon> Back
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </div>
              <IonHeader mode='ios'>
                <IonTitle>Showcase</IonTitle>
              </IonHeader>
              <br />
              <IonCard>
                <div>
                  <IonRow class="ion-padding-top">
                    <>
                      <IonTextarea
                        rows={5}
                        color="secondary"
                        maxlength={200}
                        value={showcaseText}
                        style={{ marginLeft: "2.5vw" }}
                        placeholder="Show off your projects/artwork/designs here!"
                        id="message"
                        onIonChange={(e: any) => {
                          handleShowcaseTextChange(e);
                        }}
                      ></IonTextarea>
                    </>
                  </IonRow>
                  <br />
                  <IonRow>
                    <IonFab horizontal="end" style={{
                      textAlign: "center", alignItems: "center",
                      alignSelf: "center", display: "flex", paddingTop: ""
                    }}>
                      <IonButton onClick={takePicture} mode="ios" color="" fill='clear'>
                        <IonIcon icon={cameraOutline} />
                      </IonButton>
                      <IonButton
                        onClick={() => {
                          postShowcase();
                        }}
                        color="transparent"
                        mode="ios"
                        shape="round"
                        fill="clear"
                        id="message"
                      >
                        Post
                      </IonButton>
                    </IonFab>
                  </IonRow>
                  {photo ? (
                    <>
                      <FadeIn>
                        <IonCard>
                          <IonImg src={photo?.webPath} />
                        </IonCard>
                      </FadeIn>
                    </>
                  ) : <> <br></br><br></br> </>}

                </div>
              </IonCard>
            </div>
          </IonContent>
        </IonModal> */}

{/* <FadeIn transitionDuration={500}>
                {/* <IonHeader class="ion-no-border"> */}
{/* <IonToolbar mode="ios">
                  <IonCardTitle style={{ marginLeft: "5%", fontSize: "1.5em" }}>Top Posts (All Time)</IonCardTitle> */}
{/* <IonFab horizontal="end">
                  <IonIcon icon={chevronForward} />
                </IonFab>
                <IonFab horizontal="start">
                  <IonIcon icon={chevronBack} />
                </IonFab> 
                </IonToolbar>
                {/* </IonHeader>
                <Swiper
                  slidesPerView={1.25}
                >
                  {topPosts && topPosts.length > 0
                    ? topPosts.map((post, index) => {
                      return (
                        <FadeIn>
                          <SwiperSlide key={post.key + "_allTime"}>
                            <IonCard mode="ios">
                              <IonCardContent
                                style={{ minHeight: "50vh" }}
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
                                <IonNote style={{ fontSize: "1.10em" }} color="medium" className="subtitle">
                                  {post.data.message.length > 120
                                    ? post.data.message.substring(0, 120) + "..."
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
                                      <p>{Object.keys(post.data.likes).length - 1} </p>
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
                                      <p>{Object.keys(post.data.dislikes).length - 1} </p>
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
              </FadeIn> */}
{/* <FadeIn>
                <hr style={{width: "95%"}}/>
              </FadeIn> */}

{/* <FadeIn transitionDuration={500}>
                <IonToolbar mode="ios">
                  <IonCardTitle style={{ marginLeft: "5%", fontSize: "1.5em" }}>Top Posts (Weekly)</IonCardTitle>
                  <IonFab horizontal="end">
                  <IonIcon icon={chevronForward} />
                </IonFab>
                <IonFab horizontal="start">
                  <IonIcon icon={chevronBack} />
                </IonFab>
                </IonToolbar>
                <Swiper slidesPerView={1.25}>
                  {topWeeklyPosts && topWeeklyPosts.length > 0
                    ? topWeeklyPosts.map((post, index) => {
                      return (
                        <SwiperSlide key={post.key + "_weekly"}>
                          <IonCard mode="ios">
                            <IonCardContent
                              style={{ minHeight: "50vh" }}
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
                              <IonNote style={{ fontSize: "1.10em" }} color="medium" className="subtitle">
                                {post.data.message.length > 100
                                  ? post.data.message.substring(0, 100) + "..."
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
                                    <p>{Object.keys(post.data.likes).length - 1} </p>
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
                                    <p>{Object.keys(post.data.dislikes).length - 1}</p>
                                  </IonButton>
                                </IonCol>
                              </IonRow>
                            </IonFab>
                          </IonCard>
                        </SwiperSlide>
                      );
                    })
                    : <><FadeIn><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                      <div style={{ textAlign: "center" }}><p>No posts within past week</p></div>
                      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></FadeIn></>}
                </Swiper>
              </FadeIn> */}

{/* <FadeIn transitionDuration={500}>
          <IonCard style={{ "--background": "#0FBBEC", height: "17.5%" }}>
          {weatherData ?
            <>
              <IonCard className={`card ${flip ? "flip" : ""}`} style={isDay ? { "--background": "#0FA0EC", height: "17.5%" } : { "--background": "#33495f", height: "17.5" }}>
                <div className="front" onClick={() => setFlip(() => !flip)}>
                  <IonGrid>
                    <p style={{
                      textAlign: "center", alignContent: "center",
                      alignItems: "center", alignSelf: "center", color: "white"
                    }}>{schoolName}</p>
                    <IonRow>
                      <IonCol>
                        <div>
                          <IonImg style={{ width: "120px" }} src={`/assets/images${weatherData.icon}`}></IonImg>
                        </div>
                      </IonCol>
                      <IonCol><div></div></IonCol>
                      <IonCol>
                        <div>
                          <h1 style={{ "color": "white", fontSize: "2em" }}>{Math.round(weatherData.temp)}{'\u00b0'}F</h1>
                          <h1 style={{ color: "white", fontSize: "1.5em" }}>{weatherData.text}</h1>
                        </div>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <br></br>
                    </IonRow>
                  </IonGrid>
                </div>
                {/* <div className="back" onClick={() => setFlip(() => !flip)}>
                  <IonCardContent>

                  </IonCardContent>
                </div>
              </IonCard>
            </>
            : (null)
          }
          </IonCard>
        </FadeIn > */}

        {/* <FadeIn>
          <hr style={{width: "95%"}}/>
        </FadeIn> */}
        {/* <FadeIn transitionDuration={500}>
          <IonToolbar mode="ios">
            <IonCardTitle style={{ marginLeft: "5%" }}>Showcase</IonCardTitle>
            <IonButton color="medium" fill="outline" size="small" onClick={() => { setShowcaseModal(true); }} slot="end">
              <IonIcon icon={addCircleOutline} /> {'\u00A0'}Add
            </IonButton>
          </IonToolbar>
        </FadeIn> */}
        {/* {showcase.length <= 0 ? (
          <><FadeIn><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
            <div style={{ textAlign: "center" }}><p>No showcase posts made within past week</p></div>
            <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></FadeIn></>
        ) : (
          <Swiper slidesPerView={1.25}>
            {showcase.map((post, index) => {
              return (
                <SwiperSlide key={post.key + "_weekly"}>
                  <IonCard mode="ios">
                    <IonCardContent
                      style={{ minHeight: "50vh" }}
                      onClick={() => {
                        // // handleCardClick(post, index);
                        // history.push("home/post/" + post.key);
                      }}
                    >
                      <IonCardTitle style={{ fontSize: "medium" }} mode="ios">
                        {post.userName}
                      </IonCardTitle>
                      <br></br>
                      <IonNote style={{ fontSize: "1.10em" }} color="medium" className="subtitle">
                        {post.message.length > 150
                          ? post.message.substring(0, 150) + "..."
                          : post.message}
                      </IonNote>
                      {post.imgSrc && post.imgSrc.length > 0 ? (
                        <div>
                          <br></br>
                          <IonImg
                            className="ion-img-container"
                            src={post.imgSrc}
                          />
                          <br></br>
                          <br></br>
                          <br></br>
                        </div>
                      ) : null}
                    </IonCardContent>
                    {/* <IonFab vertical="bottom">
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
            }
          </Swiper>
        )} */}
