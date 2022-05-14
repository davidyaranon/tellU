import "../App.css";
import {
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonSlides,
  IonSlide,
  IonModal,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonLoading,
  IonText,
  IonAvatar,
  IonCheckbox,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonRow,
  IonCol,
  IonSpinner,
  IonNote,
  useIonViewWillEnter,
  IonPage,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import auth, { getAllPostsNextBatch } from "../fbconfig";
import {
  addMessage,
  uploadImage,
  getAllPosts,
  promiseTimeout,
  upVote,
  downVote,
} from "../fbconfig";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Geolocation, Geoposition } from "@awesome-cordova-plugins/geolocation";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  add,
  arrowBack,
  cameraOutline,
  shareOutline,
} from "ionicons/icons";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import SignalWifiOff from "@mui/icons-material/SignalWifiOff";
import { chevronDownCircleOutline, caretUpOutline } from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { RefresherEventDetail } from "@ionic/core";
import Header, { ionHeaderStyle } from "./Header";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@agney/ir-toast";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { v4 as uuidv4 } from "uuid";
import "../theme/variables.css";
import React from "react";
import FadeIn from "react-fade-in";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import UIContext from "../my-context";
import { getColor, timeout } from '../components/functions';
import { Share } from '@capacitor/share';
import Map from "@mui/icons-material/Map";

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

defineCustomElements(window);

function Home() {
  const [newPosts, setNewPosts] = useState<any[] | null>(null);
  const pageRef = useRef();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const timeAgo = new TimeAgo("en-US");
  const { setShowTabs } = React.useContext(UIContext);
  const schoolName = useSelector((state: any) => state.user.school);
  const [busy, setBusy] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [photo, setPhoto] = useState<Photo | null>();
  const Toast = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalPicture, setShowModalPicture] = useState<boolean>(false);
  const [showReloadMessage, setShowReloadMessage] = useState<boolean>(false);
  const [modalImgSrc, setModalImgSrc] = useState("");
  const [blob, setBlob] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [message, setMessage] = useState("");
  const [generalChecked, setGeneralChecked] = useState<boolean>(true);
  const [locationChecked, setLocationChecked] = useState<boolean>(false);
  const [buySellChecked, setBuySellChecked] = useState<boolean>(false);
  const [alertChecked, setAlertChecked] = useState<boolean>(false);
  const [sightingChecked, setSightingChecked] = useState<boolean>(false);
  const [eventsChecked, setEventsChecked] = useState<boolean>(false);
  const [checkboxSelection, setCheckboxSelection] = useState<string>("general");
  const [locationPinModal, setLocationPinModal] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const [user] = useAuthState(auth);
  const [lastKey, setLastKey] = useState<string>("");
  const history = useHistory();
  const [position, setPosition] = useState<Geoposition | null>();
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const modalContentRef = useRef<HTMLIonContentElement | null>(null);
  const [newPostsLoaded, setNewPostsLoaded] = useState<boolean>(false);
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);

  useIonViewWillEnter(() => {
    setShowTabs(true);
    if (posts && schoolName) {
      setBusy(true);
      let tempPosts = promiseTimeout(20000, getAllPosts(schoolName));
      tempPosts.then((res: any) => {
        if (res.allPosts && res.allPosts != [] && res.allPosts.length != 0) { // newly updated posts
          let caught = false;
          let length = posts.length > res.allPosts.length ? res.allPosts.length : posts.length;
          for (let i = 0; i < length; ++i) {
            if (res.allPosts[i].message != posts[i].message) {
              setNewPostsLoaded(true);
              setNewPosts(res.allPosts);
              caught = true;
              break;
            }
          }
          if (!caught) {
            setPosts(res.allPosts);
          }
          setLastKey(res.lastKey);
        }
        setBusy(false);
      });
      tempPosts.catch((err: any) => {
        Toast.error(err + "\n Check your internet connection");
        setBusy(false);
      });
    }
  }, [posts, schoolName]);

  const sharePost = async (post: any) => {
    await Share.share({
      title: 'Let me tellU about this post I saw by' + post.userName,
      text: post.message,
      url: 'tellUapp.com/post/' + post.key,
    });
  }

  const scrollToTop = () => {
    contentRef.current && contentRef.current.scrollToTop(1500);
  };

  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };

  const sliderOpts = {
    zoom: true,
    maxRatio: 2,
  };

  const handleUserPageNavigation = (uid: string) => {
    history.push("home/about/" + uid);
  };
  
  const handleUpVote = async (postKey: string, index: number, post: any) => {
    const val = await upVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (posts && user) {
        let tempPosts: any[] = [...posts];
        tempPosts[index].upVotes += val;
        // setCommentModalPostUpvotes((prev) => prev + val);
        if (tempPosts[index].likes[user.uid]) {
          delete tempPosts[index].likes[user.uid];
        } else {
          if (tempPosts[index].dislikes[user.uid]) {
            delete tempPosts[index].dislikes[user.uid];
            tempPosts[index].downVotes -= 1;
            // setCommentModalPostDownvotes((prev) => prev - 1);
          }
          tempPosts[index].likes[user.uid] = true;
        }
        setPosts(tempPosts);
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
      if (posts && user) {
        let tempPosts: any[] = [...posts];
        // setCommentModalPostDownvotes((prev) => prev + val);
        tempPosts[index].downVotes += val;
        if (tempPosts[index].dislikes[user.uid]) {
          delete tempPosts[index].dislikes[user.uid];
        } else {
          if (tempPosts[index].likes[user.uid]) {
            delete tempPosts[index].likes[user.uid];
            tempPosts[index].upVotes -= 1;
            // setCommentModalPostUpvotes((prev) => prev - 1);
          }
          tempPosts[index].dislikes[user.uid] = true;
        }
        setPosts(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
  };

  const handleChange = (e: any) => {
    let currMessage = e.detail.value;
    setMessage(currMessage);
  };

  const handlePostOptions = () => {
    setLocationPinModal(true);
  };

  const handleSendMessage = async () => {
    setLocationPinModal(false);
    setShowModal(false);
    messageAdd();
    setGeneralChecked(true);
  };

  const getDate = (timestamp: any) => {
    if ("seconds" in timestamp && "nanoseconds" in timestamp) {
      const time = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      );
      return timeAgo.format(time);
    } else {
      return '';
    }
  };

  const handleCheckboxChange = (checkbox: string) => {
    switch (checkbox) {
      case "general":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        break;
      case "alert":
        setGeneralChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        break;
      case "buySell":
        setAlertChecked(false);
        setGeneralChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        break;
      case "event":
        setAlertChecked(false);
        setBuySellChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        break;
      case "sighting":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        break;
      default:
        break;
    }
  };

  const locationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
  };

  const getLocation = async () => {
    setGettingLocation(true);
    try {
      const pos = await Geolocation.getCurrentPosition(locationOptions);
      setPosition(pos);
      //console.log(pos.coords);
      setGettingLocation(false);
    } catch (e: any) {
      Toast.error("Location access denied by user, adjust in iOS Settings");
      setGettingLocation(false);
    }
  };

  const handleLoadPostsNextBatch = (event: any) => {
    setBusy(true);
    if (lastKey && user) {
      let tempPosts = promiseTimeout(20000, getAllPostsNextBatch(schoolName, lastKey));
      tempPosts.then((res: any) => {
        if (res.allPosts && res.allPosts != []) {
          console.log(res.allPosts);
          setPosts(posts?.concat(res.allPosts)!);
          setLastKey(res.lastKey);
          event.target.complete();
        } else {
          Toast.error("Unable to load posts");
        }
        setBusy(false);
      });
      tempPosts.catch((err: any) => {
        Toast.error(err);
        setBusy(false);
        setPosts(null);
        setShowReloadMessage(true);
      });
    } else {
      setNoMorePosts(true);
    }
  };

  const handleLoadPosts = () => {
    setBusy(true);
    let tempPosts = promiseTimeout(20000, getAllPosts(schoolName));
    tempPosts.then((res: any) => {
      if (res.allPosts && res.allPosts != []) {
        setPosts(res.allPosts);
        setLastKey(res.lastKey);
      } else {
        Toast.error("Unable to load posts");
      }
      setBusy(false);
    });
    tempPosts.catch((err: any) => {
      Toast.error(err);
      setBusy(false);
      setPosts(null);
      setShowReloadMessage(true);
    });
  };

  async function doRefresh(event: CustomEvent<RefresherEventDetail>) {
    setNewPostsLoaded(false);
    setNoMorePosts(false);
    handleLoadPosts();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  }

  function showPicture(src: string) {
    PhotoViewer.show(src);
  }

  async function sendImage(blob: any, uniqueId: string) {
    const res = await uploadImage("images", blob, uniqueId);
    if (res == false || photo == null || photo?.webPath == null) {
      Toast.error("unable to select photo");
    } else {
      Toast.success("photo uploaded successfully");
    }
  }

  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      });
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

  async function messageAdd() {
    if (message.trim().length == 0 && !blob) {
      Toast.error("Input a message!");
    } else if (
      !eventsChecked &&
      !buySellChecked &&
      !alertChecked &&
      !sightingChecked &&
      !generalChecked
    ) {
      Toast.error("Select a post type");
    } else {
      //setBusy(true);
      //const toast = Toast.create({message: "Uploading..."});
      //toast.present();
      let uniqueId = uuidv4();
      if (blob) {
        await sendImage(blob, uniqueId.toString());
        setBlob(null);
        setPhoto(null);
      }
      const res = await addMessage(
        message,
        blob,
        uniqueId.toString(),
        position,
        schoolName,
        checkboxSelection
      );
      if (res == "false") {
        //toast.dismiss();
        Toast.error("Unable to process message :(");
      } else {
        //toast.dismiss();
        Toast.success("Uploaded!");
        setMessage("");
        handleLoadPosts();
      }
      //setBusy(false);
    }
  }

  useEffect(() => { // run on app startup
    setShowTabs(true);
    setBusy(true);
    if (!user) {
      setBusy(false);
      history.replace("/landing-page");
    } else if (schoolName) {
      handleLoadPosts();
    }
  }, [schoolName]);

  if (posts) {
    return (
      <IonPage ref={pageRef}>
        <IonContent ref={contentRef} scrollEvents={true}>
          {newPostsLoaded ? (
            <IonFab style={{ top: "5vh" }} horizontal="center" slot="fixed">
              <IonFabButton className="load-new-posts" mode="ios" onClick={() => { setNoMorePosts(false); setNewPostsLoaded(false); setPosts(newPosts); scrollToTop(); }}>New Posts <IonIcon icon={caretUpOutline} /> </IonFabButton>
            </IonFab>
          ) : (null)}

          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <br></br>
            <br></br>
            <br></br>
            <IonRefresherContent
              pullingText="Pull to refresh"
              refreshingSpinner="crescent"
              refreshingText="Refreshing..."
            ></IonRefresherContent>
          </IonRefresher>

          <IonLoading
            spinner="dots"
            message="Adding comment"
            duration={0}
            isOpen={commentsBusy}
          ></IonLoading>

          <IonLoading
            spinner="dots"
            message="Getting Location..."
            duration={0}
            isOpen={gettingLocation}
          ></IonLoading>

          <FadeIn transitionDuration={1500}>
            <IonHeader class="ion-no-border" style={ionHeaderStyle}>
              <Header darkMode={darkModeToggled} schoolName={schoolName} />
            </IonHeader>
          </FadeIn>
          <IonModal
            showBackdrop={true}
            isOpen={locationPinModal}
            onDidDismiss={() => {
              setLocationPinModal(false);
              handleCheckboxChange("general");
            }}
            breakpoints={[0, 0.95]}
            initialBreakpoint={0.95}
            backdropBreakpoint={0.2}
          >
            <IonContent>
              <IonHeader translucent>
                <IonToolbar mode="ios">
                  <IonTitle>Post</IonTitle>
                  <IonButtons slot="end">
                    <IonButton
                      mode="ios"
                      onClick={() => {
                        setLocationPinModal(false);
                      }}
                    >
                      Close
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonList inset={true} mode="ios">
                {/* <IonListHeader mode="ios">Select One</IonListHeader> */}
                <IonItem lines="none" mode="ios">
                  <IonLabel>General</IonLabel>
                  <IonCheckbox
                    id="generalCheckbox"
                    checked={generalChecked}
                    slot="start"
                    onIonChange={(e) => {
                      handleCheckboxChange("general");
                      setGeneralChecked(e.detail.checked);
                      if (e.detail.checked) setCheckboxSelection("general");
                    }}
                  ></IonCheckbox>
                </IonItem>
                <IonItem lines="none" mode="ios">
                  <IonLabel>Alert</IonLabel>
                  <IonCheckbox
                    id="alertCheckbox"
                    checked={alertChecked}
                    slot="start"
                    onIonChange={(e) => {
                      handleCheckboxChange("alert");
                      setAlertChecked(e.detail.checked);
                      if (e.detail.checked) setCheckboxSelection("alert");
                    }}
                  ></IonCheckbox>
                </IonItem>
                <IonItem lines="none" mode="ios">
                  <IonLabel>Buy/Sell</IonLabel>
                  <IonCheckbox
                    id="buySellCheckbox"
                    checked={buySellChecked}
                    slot="start"
                    onIonChange={(e) => {
                      handleCheckboxChange("buySell");
                      setBuySellChecked(e.detail.checked);
                      if (e.detail.checked) setCheckboxSelection("buy/Sell");
                    }}
                  ></IonCheckbox>
                </IonItem>
                <IonItem lines="none" mode="ios">
                  <IonLabel>Sighting</IonLabel>
                  <IonCheckbox
                    id="sightingCheckbox"
                    checked={sightingChecked}
                    slot="start"
                    onIonChange={(e) => {
                      handleCheckboxChange("sighting");
                      setSightingChecked(e.detail.checked);
                      if (e.detail.checked) setCheckboxSelection("sighting");
                    }}
                  ></IonCheckbox>
                </IonItem>
                <IonItem lines="none" mode="ios">
                  <IonLabel>Event</IonLabel>
                  <IonCheckbox
                    id="eventCheckbox"
                    checked={eventsChecked}
                    slot="start"
                    onIonChange={(e) => {
                      handleCheckboxChange("event");
                      setEventsChecked(e.detail.checked);
                      if (e.detail.checked) setCheckboxSelection("event");
                    }}
                  ></IonCheckbox>
                </IonItem>
              </IonList>
              <IonList inset={true} mode="ios">
                <IonItem mode="ios" lines="none">
                  <IonLabel> Add pin to map?</IonLabel><Map />
                  <IonCheckbox
                    slot="start"
                    checked={locationChecked}
                    onIonChange={(e) => {
                      setLocationChecked(e.detail.checked);
                      if (e.detail.checked) getLocation();
                      else setPosition(null);
                    }}
                  />
                </IonItem>
              </IonList>
              <div className="ion-button-container">
                <IonButton
                  onClick={() => {
                    handleSendMessage();
                  }}
                  expand="full"
                  color="transparent"
                  mode="ios"
                  shape="round"
                  fill="outline"
                  id="message"
                >
                  Send
                </IonButton>
              </div>
            </IonContent>
          </IonModal>

          <IonModal backdropDismiss={false} isOpen={showModal}>
            <IonContent ref={modalContentRef} scrollEvents={true}>
              <div style={{ width: "100%" }}>
                <IonToolbar mode="ios">
                  <IonButtons slot="start">
                    <IonButton
                      onClick={() => {
                        setPhoto(null);
                        setBlob(null);
                        setShowModal(false);
                      }}
                    >
                      <IonIcon icon={arrowBack}></IonIcon> Back
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </div>
              <div>

                <br />
                <IonTextarea
                  color="secondary"
                  maxlength={500}
                  style={ionInputStyle}
                  value={message}
                  placeholder="Start typing..."
                  id="message"
                  onIonChange={(e: any) => {
                    handleChange(e);
                  }}
                ></IonTextarea>
                <br />
                <IonFab horizontal="end" style={{ textAlign: "center", alignItems: "center", alignSelf: "center", display: "flex" }}>
                  <IonButton onClick={takePicture} mode="ios" color="medium">
                    <IonIcon icon={cameraOutline} />
                  </IonButton>
                  <IonButton
                    onClick={() => {
                      handlePostOptions();
                    }}
                    color="transparent"
                    mode="ios"
                    shape="round"
                    fill="outline"
                    id="message"
                  >
                    Send
                  </IonButton>
                </IonFab>
                <br></br>
                <br></br>
                <br></br>
                <IonCard>
                  <IonImg src={photo?.webPath} />
                </IonCard>
              </div>
            </IonContent>
          </IonModal>

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton
              onClick={() => {
                setShowModal(true);
              }}
            >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          <IonModal backdropDismiss={false} isOpen={showModalPicture}>
            <IonCard>
              <IonHeader translucent>
                <IonToolbar mode="ios">
                  <IonButtons slot="end">
                    <IonButton
                      mode="ios"
                      onClick={() => {
                        setShowModalPicture(false);
                      }}
                    >
                      Close
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonSlides options={sliderOpts}>
                <IonSlide>
                  <div className="swiper zoom container">
                    <IonImg src={modalImgSrc} />
                  </div>
                </IonSlide>
              </IonSlides>
            </IonCard>
          </IonModal>

          {posts && posts.length > 0 ? (
            posts?.map((post, index) => (
              <FadeIn key={post.key}>
                <IonList inset={true} mode="ios">
                  <IonItem lines="none" mode="ios">
                    <IonLabel class="ion-text-wrap">
                      <IonText color="medium">
                        <IonRow>
                          <IonCol size="6">
                            <p>
                              <IonAvatar
                                onClick={() => {
                                  handleUserPageNavigation(post.uid);
                                }}
                                class="posts-avatar"
                              >
                                <IonImg src={post?.photoURL!}></IonImg>
                              </IonAvatar>
                              {post.userName}
                            </p>
                          </IonCol>
                          <IonCol>
                            {post.postType && post.postType != "general" ? (
                              <IonFab horizontal="end">
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
                            <IonFab style={{ bottom: "1vh" }} horizontal="end">
                              <IonNote style={{ fontSize: "0.85em" }}>
                                {getDate(post.timestamp)}
                              </IonNote>
                            </IonFab>
                          </IonCol>
                        </IonRow>
                      </IonText>
                      <h3 className="h2-message" style={{ marginLeft: "2.5%" }}>
                        {" "}
                        {post.message}{" "}
                      </h3>
                      {post.url.length > 0 ? (
                        <div className="ion-img-container">
                          <br></br>
                          <IonImg
                            className="ion-img-style"
                            onClick={() => {
                              showPicture(post.imgSrc);
                            }}
                            src={post.imgSrc}
                          />
                        </div>
                      ) : null}
                    </IonLabel>
                  </IonItem>
                  <IonItem lines="none" mode="ios">
                    <IonButton
                      onAnimationEnd={() => {
                        setLikeAnimation(-1);
                      }}
                      className={
                        likeAnimation === post.key ? "likeAnimation" : ""
                      }
                      disabled={disabledLikeButtons === index}
                      mode="ios"
                      fill="outline"
                      color={
                        user &&
                          post.likes[user.uid] !== undefined
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
                      <p>{Object.keys(post.likes).length} </p>
                    </IonButton>
                    <p>&nbsp;</p>
                    <IonButton
                      mode="ios"
                      color="medium"
                      onClick={() => {
                        history.push("home/post/" + post.key);
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
                        dislikeAnimation === post.key ? "likeAnimation" : ""
                      }
                      disabled={disabledLikeButtons === index}
                      mode="ios"
                      fill="outline"
                      color={
                        index != -1 &&
                          posts &&
                          posts[index] &&
                          "dislikes" in posts[index] &&
                          user &&
                          posts[index].dislikes[user.uid] !== undefined
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
                      <p>{Object.keys(post.dislikes).length} </p>
                    </IonButton>
                    <IonButton color="medium" slot="end" onClick={() => { sharePost(post); }}>
                      <IonIcon icon={shareOutline} />
                    </IonButton>
                  </IonItem>
                </IonList>
              </FadeIn>
            ))
          ) : (
            <div className="h3-error">
              <IonNote >
                Unable to load posts, swipe down from top to reload
              </IonNote>
              <div className="h3-error">
                <SignalWifiOff
                  fontSize="large"
                  style={{ fontSize: "4.10vh" }}
                />
              </div>
            </div>
          )}
          <IonInfiniteScroll
            onIonInfinite={(e: any) => { handleLoadPostsNextBatch(e) }}
            disabled={(lastKey.length == 0)}
          >
            <IonInfiniteScrollContent
              loadingSpinner="crescent"
              loadingText="Loading"
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </IonContent>
      </IonPage>
    );
  } else if (showReloadMessage) {
    return (
      <IonPage>
        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent
              pullingIcon={chevronDownCircleOutline}
              pullingText="Pull to refresh"
              refreshingSpinner="crescent"
              refreshingText="Refreshing..."
            ></IonRefresherContent>
          </IonRefresher>

          {/* <IonLoading
            spinner="dots"
            message="Please wait..."
            duration={0}
            isOpen={busy}
          ></IonLoading> */}

          <IonHeader class="ion-no-border" style={ionHeaderStyle}>
            <Header />
          </IonHeader>

          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent
              pullingIcon={chevronDownCircleOutline}
              pullingText="Pull to refresh"
              refreshingSpinner="crescent"
              refreshingText="Refreshing..."
            ></IonRefresherContent>
          </IonRefresher>
          <div>
            <h3 className="h3-error">
              {" "}
              Unable to load posts, swipe down from top to reload page{" "}
            </h3>
            <div className="h3-error">
              <SignalWifiOff fontSize="large" style={{ fontSize: "4.10vh" }} />
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  } else {
    return (
      <div className="ion-spinner">
        <IonSpinner color="primary" />
      </div>
    )
  }
}

export default React.memo(Home);