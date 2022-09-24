import "../App.css";
import "../theme/variables.css";

import {
  IonAvatar, IonButton, IonButtons, IonCard, IonCheckbox, IonCol,
  IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon,
  IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList,
  IonLoading, IonModal, IonNote, IonPage, IonProgressBar, IonRefresher, IonRefresherContent,
  IonRow, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar,
} from "@ionic/react";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Image as CapacitorImage, PhotoViewer as CapacitorPhotoViewer } from '@capacitor-community/photoviewer';
import { Geolocation, Geoposition } from "@awesome-cordova-plugins/geolocation";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import Header, { ionHeaderStyle } from "./Header";
import { RefresherEventDetail, RouterDirection } from "@ionic/core";
import { add, cameraOutline } from "ionicons/icons";
import { addMessage, downVote, getAllPosts, promiseTimeout, upVote } from "../fbconfig";
import auth, { getAllPostsNextBatch, getLikes, storage } from "../fbconfig";
import { caretUpOutline, chevronDownCircleOutline } from "ionicons/icons";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getColor, timeout } from '../components/functions';
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";

import FadeIn from "react-fade-in";
import ForumIcon from "@mui/icons-material/Forum";
import { Keyboard } from "@capacitor/keyboard";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Linkify from 'linkify-react';
import Map from "@mui/icons-material/Map";
import ProfilePhoto from "./ProfilePhoto";
import React from "react";
import RoomIcon from '@mui/icons-material/Room';
import SignalWifiOff from "@mui/icons-material/SignalWifiOff";
import TimeAgo from "javascript-time-ago";
import UIContext from "../my-context";
import { db } from '../fbconfig';
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import en from "javascript-time-ago/locale/en.json";
import { uploadBytesResumable } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { useIonRouter } from "@ionic/react";
import { useSelector } from "react-redux";
import { useToast } from "@agney/ir-toast";
import { v4 as uuidv4 } from "uuid";

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

defineCustomElements(window);

const ionInputStyle = {
  height: "12.5vh",
  width: "95vw",
  marginLeft: "2.5vw",
};

const locationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
};

function Home() {
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const router = useIonRouter();
  const pageRef = useRef();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const timeAgo = new TimeAgo("en-US");
  const { setShowTabs } = React.useContext(UIContext);
  const schoolName = useSelector((state: any) => state.user.school);

  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [photo, setPhoto] = useState<Photo | null>();
  const Toast = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showReloadMessage, setShowReloadMessage] = useState<boolean>(false);
  const [blob, setBlob] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[] | null>(null);
  const postsRef = useRef<any>();
  postsRef.current = posts;
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
  const [user] = useAuthState(auth);
  const [lastKey, setLastKey] = useState<string>("");
  const history = useHistory();
  const [position, setPosition] = useState<Geoposition | null>();
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const modalContentRef = useRef<HTMLIonContentElement | null>(null);
  const [newPostsLoaded, setNewPostsLoaded] = useState<boolean>(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [originalLastKey, setOriginalLastKey] = useState<string>("");
  const originalLastKeyRef = useRef<any>();
  originalLastKeyRef.current = originalLastKey;
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
  const [prevPostUploading, setPrevPostUploading] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }

  // const sharePost = async (post: any) => {
  //   await Share.share({
  //     title: post.userName + "'s Post",
  //     text: 'Let me tellU about this post I saw. \n\n \"' + post.message + '\"\n\n',
  //     url: 'http://tellUapp.com/post/' + post.key,
  //   });
  // }

  const scrollToTop = () => {
    contentRef.current && contentRef.current.scrollToTop(1000);
  };

  const handleUserPageNavigation = (uid: string) => {
    dynamicNavigate('about/' + uid, 'forward');
    // history.push("/about/" + uid);
  };

  const handleUpVote = async (postKey: string, index: number, post: any) => {
    const val = await upVote(postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (posts && user) {
        let tempPosts: any[] = [...posts];
        tempPosts[index].upVotes += val;
        if (tempPosts[index].likes[user.uid]) {
          delete tempPosts[index].likes[user.uid];
        } else {
          if (tempPosts[index].dislikes[user.uid]) {
            delete tempPosts[index].dislikes[user.uid];
            tempPosts[index].downVotes -= 1;
          }
          tempPosts[index].likes[user.uid] = true;
        }
        setPosts(tempPosts);
        await timeout(100).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to like post :(");
      setDisabledLikeButtons(-1);
    }
  };

  const handleDownVote = async (postKey: string, index: number, post: any) => {
    const val = await downVote(postKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (posts && user) {
        let tempPosts: any[] = [...posts];
        tempPosts[index].downVotes += val;
        if (tempPosts[index].dislikes[user.uid]) {
          delete tempPosts[index].dislikes[user.uid];
        } else {
          if (tempPosts[index].likes[user.uid]) {
            delete tempPosts[index].likes[user.uid];
            tempPosts[index].upVotes -= 1;
          }
          tempPosts[index].dislikes[user.uid] = true;
        }
        setPosts(tempPosts);
        await timeout(100).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
      setDisabledLikeButtons(-1);
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
    if (!timestamp) {
      return '';
    }
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

  const getLocation = async () => {
    setGettingLocation(true);
    try {
      const pos = await Geolocation.getCurrentPosition(locationOptions);
      setPosition(pos);
      setGettingLocation(false);
    } catch (e: any) {
      Toast.error("Location access denied by user, adjust in iOS Settings");
      setGettingLocation(false);
    }
  };

  const handleLoadPostsNextBatch = (event: any) => {
    // setBusy(true);
    if (lastKey && user) {
      let tempPosts = promiseTimeout(20000, getAllPostsNextBatch(schoolName, lastKey));
      tempPosts.then(async (res: any) => {
        if (res.allPosts) {
          for (let i = 0; i < res.allPosts.length; ++i) {
            const data = await getLikes(res.allPosts[i].key);
            if (data) {
              res.allPosts[i].likes = data.likes;
              res.allPosts[i].dislikes = data.dislikes;
              res.allPosts[i].commentAmount = data.commentAmount;
            } else {
              res.allPosts[i].likes = {};
              res.allPosts[i].dislikes = {};
              res.allPosts[i].commentAmount = 0;
            }
          }
          setPosts(posts?.concat(res.allPosts)!);
          setLastKey(res.lastKey);
          event.target.complete();
        } else {
          Toast.error("Unable to load posts");
        }
        // setBusy(false);
      });
      tempPosts.catch((err: any) => {
        Toast.error(err);
        // setBusy(false);
        setPosts(null);
        setShowReloadMessage(true);
      });
    } else {
      // setNoMorePosts(true);
    }
  };

  const handleLoadPosts = () => {
    // setBusy(true);
    let tempPosts = promiseTimeout(20000, getAllPosts(schoolName));
    tempPosts.then(async (res: any) => {
      if (res.allPosts) {
        for (let i = 0; i < res.allPosts.length; ++i) {
          const data = await getLikes(res.allPosts[i].key);
          if (data) {
            res.allPosts[i].likes = data.likes;
            res.allPosts[i].dislikes = data.dislikes;
            res.allPosts[i].commentAmount = data.commentAmount;
          } else {
            res.allPosts[i].likes = {};
            res.allPosts[i].dislikes = {};
            res.allPosts[i].commentAmount = 0;
          }
        }
        setPosts(res.allPosts);
        setLastKey(res.lastKey);
        // console.log(res.lastKey);
        setOriginalLastKey(res.lastKey);
      } else {
        Toast.error("Unable to load posts");
      }
      // setBusy(false);
    });
    tempPosts.catch((err: any) => {
      Toast.error(err);
      // setBusy(false);
      setPosts(null);
      setShowReloadMessage(true);
    });
  };

  async function doRefresh(event: CustomEvent<RefresherEventDetail>) {
    setNewPostsLoaded(false);
    setLastKey(originalLastKey);
    handleLoadPosts();
    setTimeout(() => {
      event.detail.complete();
    }, 250);
  };

  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      });
      // console.log(image);
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
  };

  async function messageAdd() {
    if (message.trim().length == 0 && !blob && !photo) {
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
      setPrevPostUploading(true);
      setShowProgressBar(true);
      let uniqueId = uuidv4();
      if (blob && photo) {
        setPhoto(null);
        if (user) {
          const currentUserUid = user.uid;
          const storageRef = ref(
            storage,
            "images/" + currentUserUid.toString() + uniqueId
          );
          const uploadTask = uploadBytesResumable(
            storageRef, blob
          );
          uploadTask.on('state_changed',
            (snapshot) => {
              const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              // console.log('Upload is ' + p + '% done');
              setShowProgressBar(true);
              // setProgressPercentage((p + 5).toString());
              // switch (snapshot.state) {
              //   case 'paused':
              //     // console.log('Upload is paused');
              //     break;
              //   case 'running':
              //     // console.log('Upload is running');
              //     break;
              // }
            },
            (error) => {
              setShowProgressBar(false);
              setPrevPostUploading(false);
              Toast.error(error.message.toString());
            },
            async () => {
              // success
              setBlob(null);
              // setProgressPercentage('150');
              const res = await addMessage(
                message,
                blob,
                uniqueId.toString(),
                position,
                schoolName,
                checkboxSelection
              );
              if (res == "false") {
                Toast.error("Unable to process message :(");
                setShowProgressBar(false);
              } else {
                Toast.success("Uploaded!");
                setMessage("");
                //handleLoadPosts();
                // setProgressPercentage('200');
                setPrevPostUploading(false);
                setShowProgressBar(false);
                scrollToTop();
              }
              // setBusy(false);
            }
          );
        }
      } else {
        // setProgressPercentage('50');
        const res = await addMessage(
          message,
          blob,
          uniqueId.toString(),
          position,
          schoolName,
          checkboxSelection
        );
        if (res == "false" || !res) {
          Toast.error("Unable to process message :(");
          setShowProgressBar(false);
          setPrevPostUploading(false);
        } else {
          // setProgressPercentage('100');
          Toast.success("Uploaded!");
          setMessage("");
          // handleLoadPosts();
          scrollToTop();
          setShowProgressBar(false);
          setPrevPostUploading(false);
        }
        // setBusy(false);
      }
    }
  };

  useEffect(() => { // run on app startup
    setShowTabs(true);
    // setBusy(true);
    if (!user) {
      // setBusy(false);
      history.replace("/landing-page");
      setProfilePhoto(null);
      setPosts([]);
    } else if (schoolName && !profilePhoto) {
      getDownloadURL(ref(storage, "profilePictures/" + user.uid + "photoURL"))
        .then((url: string) => {
          setProfilePhoto(url);
        }).catch((err) => {
          console.log(err);
        });
    }
    let school = "blank";
    if (schoolName) {
      school = schoolName.toString().replace(/\s+/g, "");
    }
    const q = query(collection(db, "schoolPosts", school, "allPosts"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data: any = [];
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          data.push({
            ...change.doc.data(),
            key: change.doc.id,
          });
        }
      });
      if (data.length > 0) {
        if (postsRef.current) {
          for (let i = 0; i < data.length; ++i) {
            data[i].likes = { 'null': true };
            data[i].dislikes = { 'null': true };
            data[i].commentAmount = 0;
          }
          await timeout(1000);
          setPosts([...data, ...postsRef.current]);
          setNewPostsLoaded(true);
        } else { // on init
          for (let i = 0; i < data.length; ++i) {
            const likesData = await getLikes(data[i].key);
            if (likesData) {
              data[i].likes = likesData.likes;
              data[i].dislikes = likesData.dislikes;
              data[i].commentAmount = likesData.commentAmount;
            } else {
              data[i].likes = { 'null': true };
              data[i].dislikes = { 'null': true };
              data[i].commentAmount = 0;
            }
          }
          setPosts(data);
          setLastKey(data[data.length - 1].timestamp);
          setOriginalLastKey(data[data.length - 1].timestamp);
        }
      }
    });
    return () => { unsubscribe(); };
  }, [user, schoolName]);

  if (posts) {
    return (
      <IonPage ref={pageRef}>
        <IonContent ref={contentRef} scrollEvents={true} fullscreen={true} onIonScroll={(e) => {
          setScrollPosition(e.detail.scrollTop);
          if (scrollPosition < 100) {
            setNewPostsLoaded(false);
          }
        }}>
          {newPostsLoaded && scrollPosition >= 100 ? (
            <IonFab style={{ top: "5vh" }} horizontal="center" slot="fixed">
              <IonFabButton color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"} className="load-new-posts" mode="ios" onClick={() => { setNewPostsLoaded(false); scrollToTop(); }}>New Posts <IonIcon icon={caretUpOutline} /> </IonFabButton>
            </IonFab>
          ) : (null)}

          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent
              pullingText="Pull to refresh"
              refreshingSpinner="crescent"
              refreshingText="Refreshing..."
            ></IonRefresherContent>
          </IonRefresher>

          <IonLoading
            spinner="dots"
            message="Getting Location..."
            duration={0}
            isOpen={gettingLocation}
          ></IonLoading>

          <FadeIn transitionDuration={1500}>
            <IonHeader class="ion-no-border" style={ionHeaderStyle} >
              <Header darkMode={darkModeToggled} schoolName={schoolName} zoom={1} />
            </IonHeader>
          </FadeIn>

          <IonModal
            isOpen={locationPinModal}
            onDidDismiss={() => {
              setLocationPinModal(false);
              handleCheckboxChange("general");
            }}
            breakpoints={[0, 0.99]}
            initialBreakpoint={0.99}
            handle={false}
          >
            {/* <IonContent> */}
            <IonHeader translucent>
              <IonToolbar mode="ios">
                <IonTitle>Post</IonTitle>
                <IonButtons slot="start">
                  <IonButton
                    color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"} 
                    mode="ios"
                    onClick={() => {
                      setLocationPinModal(false);
                    }}
                  >
                    Back
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
                <IonLabel> Add pin to map?*</IonLabel><Map />
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
            <IonNote style={{ textAlign: "center" }}>*Location pin stays on map for up to two days</IonNote>
            <br />
            <div className="ion-button-container">
              <IonButton
                onClick={() => {
                  handleSendMessage();
                }}
                expand="block"
                color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"} 
                mode="ios"
                shape="round"
                fill="outline"
                id="message"
                style={{ width: "75vw" }}
              >
                Post
              </IonButton>
            </div>
            {/* </IonContent> */}
          </IonModal>

          <IonModal backdropDismiss={false} isOpen={showModal} animated mode='ios'
          >
            <IonContent ref={modalContentRef} scrollEvents={true}>
              <div style={{ width: "100%" }}>
                <IonToolbar mode="ios">
                  <IonButtons slot="start">
                    <IonButton
                      color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"}
                      mode="ios"
                      onClick={() => {
                        setPhoto(null);
                        setBlob(null);
                        Keyboard.hide().then(() => {
                          setTimeout(() => setShowModal(false), 100)
                        }).catch((err) => {
                          setTimeout(() => setShowModal(false), 100)
                        });;
                      }}
                    >
                      Close
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </div>
              <IonCard>
                <div>
                  <IonRow class="ion-padding-top">
                    {profilePhoto ? (
                      <>
                        <IonCol size="2">
                          <IonAvatar>
                            <img
                              src={profilePhoto} />
                          </IonAvatar>
                        </IonCol>
                        <IonCol>
                          <IonTextarea
                            debounce={250}
                            spellcheck={true}
                            ref={inputRef}
                            rows={4}
                            color="secondary"
                            maxlength={500}
                            disabled={prevPostUploading}
                            value={message}
                            placeholder="Start typing..."
                            id="message"
                            onIonChange={(e: any) => {
                              handleChange(e);
                            }}
                          ></IonTextarea>
                        </IonCol>
                      </>
                    )
                      : (
                        <>
                          <IonTextarea
                            debounce={250}
                            spellcheck={true}
                            ref={inputRef}
                            rows={4}
                            color="secondary"
                            maxlength={500}
                            style={ionInputStyle}
                            value={message}
                            disabled={prevPostUploading}
                            placeholder="Start typing..."
                            id="message"
                            onIonChange={(e: any) => {
                              handleChange(e);
                            }}
                          ></IonTextarea>
                        </>
                      )}
                  </IonRow>
                  <br />
                  <IonRow>
                    <IonFab horizontal="end" style={{
                      textAlign: "center", alignItems: "center",
                      alignSelf: "center", display: "flex", paddingTop: ""
                    }}>
                      <IonButton onClick={takePicture} mode="ios" color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"} fill='clear' disabled={prevPostUploading}>
                        <IonIcon icon={cameraOutline} />
                      </IonButton>
                      <IonButton
                        color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"} 
                        onClick={() => {
                          handlePostOptions();
                        }}
                        mode="ios"
                        shape="round"
                        fill="clear"
                        id="message"
                        disabled={prevPostUploading}
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
              {prevPostUploading &&
                <p style={{ textAlign: "center" }}>Wait until previous post has <br />uploaded to post again</p>}
            </IonContent>
          </IonModal>

          <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{}}>
            <IonFabButton
              color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"}
              onClick={() => {
                setShowModal(true);
              }}
            >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          {posts && posts.length > 0 ? (
            posts?.map((post, index) => (
              <FadeIn key={post.key}>
                <IonList inset={true} mode="ios">
                  <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate("post/" + post.key, 'forward'); }}>
                    <IonLabel class="ion-text-wrap">
                      <IonText color="medium">
                        <FadeIn>
                          <IonAvatar
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserPageNavigation(post.uid);
                            }}
                            class="posts-avatar"
                          >
                            <ProfilePhoto uid={post.uid}></ProfilePhoto>
                          </IonAvatar>
                        </FadeIn>
                        <p>
                          {post.userName}
                        </p>
                      </IonText>
                      {post.postType ? (
                        <IonFab vertical="top" horizontal="end">
                          {post.postType !== "general" ?
                            <p
                              style={{
                                fontWeight: "bold",
                                color: getColor(post.postType),
                              }}
                            >
                              {post.postType.toUpperCase()}
                              &nbsp;
                              {post.marker ? (
                                <RoomIcon
                                  style={{ fontSize: "1em" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    localStorage.setItem("lat", (post.location[0].toString()));
                                    localStorage.setItem("long", (post.location[1].toString()));
                                    dynamicNavigate("maps", 'forward');
                                  }}
                                />
                              ) : null}
                            </p>
                            :
                            <p
                              style={{
                                fontWeight: "bold",
                                color: getColor(post.postType),
                                marginLeft: "75%"
                              }}
                            >
                              {post.marker ? (
                                <RoomIcon onClick={(e) => {
                                  e.stopPropagation();
                                  localStorage.setItem("lat", (post.location[0].toString()));
                                  localStorage.setItem("long", (post.location[1].toString()));
                                  dynamicNavigate("maps", 'forward');
                                }}
                                  style={{ fontSize: "1em" }} />) : null}
                            </p>
                          }
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
                      <div style={{ height: "0.75vh" }}>{" "}</div>
                      <Linkify tagName="h3" className="h2-message">
                        {post.message}
                      </Linkify>
                      {"imgSrc" in post && post.imgSrc &&
                        post.imgSrc.length > 0 ? (
                        <>
                          <div style={{ height: "0.75vh" }}>{" "}</div>
                          <div
                            className="ion-img-container"
                            style={{ backgroundImage: `url(${post.imgSrc})`, borderRadius: '10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const img: CapacitorImage = {
                                url: post.imgSrc,
                                title: `${post.userName}'s post`
                              };
                              CapacitorPhotoViewer.show({
                                images: [img],
                                mode: 'one',
                                options: {
                                  title: true
                                }
                              }).catch((err) => {
                                Toast.error('Unable to open image on web version');
                              });
                              // PhotoViewer.show(post.imgSrc, `${post.userName}'s post`);
                            }}
                          >
                          </div>
                        </>
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
                          post.likes[user.uid] !== undefined && schoolName !== "Cal Poly Humboldt"
                          ? "primary"
                          : user && post.likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt"
                            ? "tertiary"
                            : "medium"
                      }
                      onClick={() => {
                        setLikeAnimation(post.key);
                        setDisabledLikeButtons(index);
                        handleUpVote(post.key, index, post);
                      }}
                    >
                      <KeyboardArrowUpIcon />
                      <p>{Object.keys(post.likes).length - 1} </p>
                    </IonButton>
                    <p>&nbsp;</p>
                    <IonButton
                      mode="ios"
                      color="medium"
                      onClick={() => {
                        dynamicNavigate("post/" + post.key, 'forward');
                        // history.push("/userPost/" + post.key);
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
                      <p>{Object.keys(post.dislikes).length - 1} </p>
                    </IonButton>
                    {/* <IonButton color="medium" slot="end" onClick={() => { sharePost(post); }}>
                      <IonIcon icon={shareOutline} />
                    </IonButton> */}
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
          <br></br><br></br><br></br>
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
        {showProgressBar &&
          <FadeIn>
            {/* <div slot="fixed" style={{ width: "100%" }}> */}
            <IonFooter mode='ios' >
              {/* <IonToolbar mode="ios" translucen> */}
              {/* <ProgressBar percentage={progressPercentage} /> */}
              <IonProgressBar type="indeterminate"></IonProgressBar>
              {/* </IonToolbar> */}
            </IonFooter>
            {/* </div> */}
          </FadeIn>
        }
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
        <IonSpinner
          color={
            schoolName === "Cal Poly Humboldt"
              ? "tertiary"
              : "primary"
          }
        />
      </div>
    )
  }
}

export default React.memo(Home);