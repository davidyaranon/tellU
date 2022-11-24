import "../App.css";
import "../theme/variables.css";

import {
  IonAvatar, IonButton, IonButtons, IonCard, IonCheckbox, IonCol,
  IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon,
  IonImg, IonItem, IonLabel, IonList,
  IonLoading, IonModal, IonNote, IonPage, IonProgressBar, IonRefresher, IonRefresherContent,
  IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar,
} from "@ionic/react";
import { Camera, GalleryPhoto } from "@capacitor/camera";
import { Geolocation, GeolocationOptions, Geoposition } from "@awesome-cordova-plugins/geolocation";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import TellUHeader, { ionHeaderStyle } from "./Header";
import { RefresherEventDetail, RouterDirection } from "@ionic/core";
import { add, cameraOutline, refreshCircleOutline, warningSharp } from "ionicons/icons";
import { addMessage, downVote, getAllPosts, promiseTimeout, upVote } from "../fbconfig";
import auth, { getAllPostsNextBatch, getLikes, storage } from "../fbconfig";
import { chevronDownCircleOutline } from "ionicons/icons";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getColor, timeout } from '../components/functions';
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@capacitor/dialog";

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
import { useTabsContext } from "../my-context";
import { db } from '../fbconfig';
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import en from "javascript-time-ago/locale/en.json";
import { uploadBytes } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { useIonRouter } from "@ionic/react";
import { useSelector } from "react-redux";
import { useToast } from "@agney/ir-toast";
import { v4 as uuidv4 } from "uuid";
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import { Virtuoso } from 'react-virtuoso';
import PostImages from "./PostImages";
import tree from "../images/tree_.png";
import humboldt from "../images/humboldt.png";
import ozzie from '../images/ozzie_box.png';
import axe from '../images/axe.png';
import house from '../images/house.png';
import dollar from '../images/dollar.png';
import research from '../images/research.png';
import event from '../images/event.png';

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

const locationOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
};

const Home = React.memo(() => {
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const router = useIonRouter();
  const pageRef = useRef();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const timeAgo = new TimeAgo("en-US");
  const tabs = useTabsContext();
  const schoolName = useSelector((state: any) => state.user.school);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const sensitiveToggled = useSelector((state: any) => state.sensitive.sensitiveContent);

  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [photo, setPhoto] = useState<GalleryPhoto[] | null>([]);
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
  const [researchChecked, setResearchChecked] = useState<boolean>(false);
  const [housingChecked, setHousingChecked] = useState<boolean>(false);
  const [diningChecked, setDiningChecked] = useState<boolean>(false);
  const [checkboxSelection, setCheckboxSelection] = useState<string>("general");
  const [locationPinModal, setLocationPinModal] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [selectOptions, setSelectOptions] = useState<any>({});
  const [selectOptionsNumber, setSelectOptionsNumber] = useState<any>({});
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
  const [postClassName, setPostClassName] = useState<string>()
  const [postClassNumber, setPostClassNumber] = useState<string>();
  const [noMorePosts, setNoMorePosts] = useState(false);

  const [newData, setNewData] = useState<any[] | null>(null);
  const newDataRef = useRef<any>();
  newDataRef.current = newData;
  const virtuosoRef = useRef<any>(null);

  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }

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
        setResearchChecked(false);
        setHousingChecked(false);
        setDiningChecked(false);
        break;
      case "alert":
        setGeneralChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        setDiningChecked(false);
        break;
      case "buySell":
        setAlertChecked(false);
        setGeneralChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        setDiningChecked(false);
        break;
      case "event":
        setAlertChecked(false);
        setBuySellChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        setDiningChecked(false);
        break;
      case "sighting":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        setDiningChecked(false);
        break;
      case "research":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        setHousingChecked(false);
        setDiningChecked(false);
        break;
      case "housing":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setDiningChecked(false);
        break;
      case "dining":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
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
    console.log('inf')
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
          if (event)
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
      setNoMorePosts(true);
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
      const images = await Camera.pickImages({
        quality: 50,
        limit: 3,
      });
      let blobsArr: any[] = [];
      let photoArr: GalleryPhoto[] = [];
      for (let i = 0; i < images.photos.length; ++i) {
        let res = await fetch(images.photos[i].webPath!);
        let blobRes = await res.blob();
        blobsArr.push(blobRes);
        photoArr.push(images.photos[i]);
      }
      setPhoto(photoArr);
      setBlob(blobsArr);
      // const res = await fetch(image.webPath!);
      // const blobRes = await res.blob();
      // if (blobRes) {
      //   if (blobRes.size > 5_000_000) {
      //     // 5MB
      //     Toast.error("Image too large");
      //   } else {
      //     setBlob(blobRes);
      //     setPhoto(image);
      //   }
      // }
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  };

  async function messageAdd() {
    if (message.trim().length == 0 && (!blob || blob.length == 0) && (!photo || photo.length == 0)) {
      Toast.error("Input a message!");
    } else if (
      !eventsChecked &&
      !buySellChecked &&
      !alertChecked &&
      !sightingChecked &&
      !generalChecked &&
      !researchChecked &&
      !housingChecked &&
      !diningChecked
    ) {
      Toast.error("Select a post type");
    } else {
      setPrevPostUploading(true);
      setShowProgressBar(true);
      let uniqueId = uuidv4();
      let docId = uuidv4();
      if (blob && photo) {
        setPhoto([]);
        if (user) {
          const promises = [];
          const currentUserUid = user.uid;
          for (var i = 0; i < blob.length; i++) {
            const file = blob[i];
            let storageRef = ref(storage, "images/" + currentUserUid.toString() + uniqueId + i.toString());
            promises.push(uploadBytes(storageRef, file).then(uploadResult => { return getDownloadURL(uploadResult.ref) }))
          }
          const photos = await Promise.all(promises);
          const notificationsToken = localStorage.getItem("notificationsToken") || "";
          const res = await addMessage(
            message,
            photos,
            uniqueId.toString(),
            position,
            schoolName,
            notificationsToken,
            checkboxSelection,
            postClassName,
            postClassNumber,
            docId,
          );
          setBlob([]);
          if (!res) {
            Toast.error("Unable to process message, check internet connection :(");
            setShowProgressBar(false);
          } else {
            Toast.success("Uploaded!");
            setLocationChecked(false);
            setMessage("");
            setPostClassName("");
            setPostClassNumber("");
            setPrevPostUploading(false);
            setShowProgressBar(false);
            // scrollToTop();
          }
          // setBusy(false);
        }
      } else {
        const notificationsToken = localStorage.getItem("notificationsToken") || "";
        const res = await addMessage(
          message,
          blob,
          uniqueId.toString(),
          position,
          schoolName,
          notificationsToken,
          checkboxSelection,
          postClassName,
          postClassNumber,
          docId,
        );
        if (!res) {
          Toast.error("Unable to process message, check internet connection :(");
          setShowProgressBar(false);
          setPrevPostUploading(false);
        } else {
          // setProgressPercentage('100');
          Toast.success("Uploaded!");
          setLocationChecked(false);
          setMessage("");
          setPostClassName("");
          setPostClassNumber("");
          // handleLoadPosts();
          // scrollToTop();
          setShowProgressBar(false);
          setPrevPostUploading(false);
        }
        // setBusy(false);
      }
    }
    console.log("message added");
  };

  useEffect(() => {
    console.log('1');
    if (schoolName === "Cal Poly Humboldt" && schoolColorToggled) {
      setSelectOptions({
        cssClass: 'my-custom-interface',
        header: 'Class',
        subHeader: 'Select a class to post about'
      })
      setSelectOptionsNumber({
        cssClass: 'my-custom-interface',
        header: 'Class Number',
        subHeader: 'Select a class number'
      });
    } else {
      setSelectOptions({
        header: 'Class',
        subHeader: 'Select a class to post about'
      });
      setSelectOptionsNumber({
        header: 'Class Number',
        subHeader: 'Select a class number'
      });
    }
  }, [schoolColorToggled])

  useEffect(() => { // run on app startup
    console.log("use effect");
    // setBusy(true);
    if (!user) {
      // setBusy(false);
      history.replace("/landing-page");
      setProfilePhoto(null);
      setPosts([]);
      tabs.setShowTabs(false);
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
    const q = query(collection(db, "schoolPosts", school, "allPosts"), orderBy("timestamp", "desc"), limit(15));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data: any = [];
      for (let i = 0; i < snapshot.docChanges().length; ++i) {
        let change = snapshot.docChanges()[i];
        console.log(change.type);
        console.log(change.doc.data());
        if (auth && auth.currentUser && auth.currentUser.uid) {
          if ((change.type === "added") && change.doc.data().uid === auth.currentUser.uid && snapshot.docChanges().length === 2) {
            let datasCopy = newDataRef.current || [];
            console.log(datasCopy);
            let justAdded: any[] = [];
            for (let i = 0; i < datasCopy.length; ++i) {
              datasCopy[i].likes = { 'null': true };
              datasCopy[i].dislikes = { 'null': true };
              datasCopy[i].commentAmount = 0;
            }
            console.log(datasCopy);
            justAdded.push({
              ...change.doc.data(),
              key: change.doc.id
            });
            justAdded[0].likes = { 'null': true };
            justAdded[0].dislikes = { 'null': true };
            justAdded[0].commentAmount = 0;
            console.log(justAdded);
            const finalData: any[] = justAdded.concat(datasCopy);
            console.log(finalData);
            await timeout(500);
            setPosts([...finalData, ...postsRef.current]);
            virtuosoRef && virtuosoRef.current && virtuosoRef.current.scrollTo({ top: 0, behavior: "auto" })
            setNewPostsLoaded(false);
            setNewData([]);
            break; // needed?
          } else {
            console.log("long if check failed")
            console.log(change.type === "added");
            console.log(change.doc.data().uid === auth.currentUser.uid);
            console.log(snapshot.docChanges().length);
          }
        } else {
          console.log("something wrong with auth")
        }
        if (change.type === "added") {
          data.push({
            ...change.doc.data(),
            key: change.doc.id,
          });
        }
      }
      console.log("after for each");
      if (data.length > 0) {
        console.log("data length > 0");
        if (postsRef.current) {
          console.log("post ref current");
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
          console.log(newData);
          console.log(newDataRef.current);
          console.log("after data for loop");
          console.log(data);
          if (newDataRef.current) {
            console.log("more than 1 new post");
            setNewData([...data, ...newDataRef.current])
          } else {
            console.log("Only one new post");
            setNewData(data);
          }
          console.log("after set data");
          setNewPostsLoaded(true);
          console.log("after set true");
        } else { // on init
          console.log("init");
          // setLatestTimestamp(data[0].timestamp);
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
          tabs.setShowTabs(true);
        }
      }
    });
    return () => { unsubscribe(); };
  }, [user, schoolName]);

  const Footer = () => {
    return (
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {!noMorePosts ? "Loading..." : ""}
      </div>
    )
  }

  const Header = React.memo(() => {
    return (
      <>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent
            pullingText="Pull to refresh"
            refreshingSpinner="crescent"
            refreshingText="Refreshing..."
          ></IonRefresherContent>
        </IonRefresher>
        <IonHeader class="ion-no-border" style={ionHeaderStyle} >
          <TellUHeader darkMode={darkModeToggled} colorPallete={schoolColorToggled} schoolName={schoolName} zoom={1} />
        </IonHeader>
      </>
    )
  });

  const handleImgLoad = (didLoad: boolean) => {
    if (didLoad) {
      console.log("img loaded");
      virtuosoRef && virtuosoRef.current && virtuosoRef.current.autoscrollToBottom();
    }
  };


  if (posts && posts.length > 0) {
    return (
      <IonPage>
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{}}>
          <IonFabButton
            color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
            onClick={() => {
              setShowModal(true);
            }}
          >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <div>
          {newPostsLoaded && (
            <IonFab style={{ top: "5vh" }} horizontal="center" slot="fixed">
              <IonFabButton color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} className="load-new-posts" mode="ios" onClick={() => {
                setPosts([...newDataRef.current, ...postsRef.current]);
                virtuosoRef && virtuosoRef.current && virtuosoRef.current.scrollTo({ top: 0, behavior: "auto" })
                setNewPostsLoaded(false);
                setNewData([]);
              }
              }>New Posts <IonIcon icon={refreshCircleOutline} /> </IonFabButton>
            </IonFab>
          )}
          {
            showProgressBar &&
            <FadeIn>
              {/* <div slot="fixed" style={{ width: "100%" }}> */}
              <IonFooter mode='ios' slot="bottom">
                {/* <IonToolbar mode="ios" translucen> */}
                {/* <ProgressBar percentage={progressPercentage} /> */}
                <IonProgressBar type="indeterminate" color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} style={{ height: "0.5vh" }}></IonProgressBar>
                {/* </IonToolbar> */}
              </IonFooter>
              {/* </div> */}
            </FadeIn>
          }
        </div>

        <IonLoading
          spinner="dots"
          message="Getting Location..."
          duration={0}
          isOpen={gettingLocation}
        ></IonLoading>

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
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
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
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img src={humboldt} style={{ height: "3vh" }} />
              }
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
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img style={{ float: "right", height: "3vh", transform: "translateX(10%)" }} src={axe} />
              }
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
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img src={dollar} style={{ height: "3vh" }} />
              }
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
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img src={tree} style={{ transform: "translateX(-5%)", height: "3vh" }} />
              }
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
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img src={event} style={{ height: "3vh" }} />
              }
            </IonItem>
            <IonItem lines="none" mode="ios">
              <IonLabel>Research</IonLabel>
              <IonCheckbox
                id="researchCheckbox"
                checked={researchChecked}
                slot="start"
                onIonChange={(e) => {
                  handleCheckboxChange("research");
                  setResearchChecked(e.detail.checked);
                  if (e.detail.checked) setCheckboxSelection("research");
                }}
              ></IonCheckbox>
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img src={research} style={{ transform: "translateX(10%)", height: "3vh" }} />
              }
            </IonItem>
            <IonItem lines="none" mode="ios">
              <IonLabel>Housing</IonLabel>
              <IonCheckbox
                id="housingCheckbox"
                checked={housingChecked}
                slot="start"
                onIonChange={(e) => {
                  handleCheckboxChange("housing");
                  setHousingChecked(e.detail.checked);
                  if (e.detail.checked) setCheckboxSelection("housing");
                }}
              ></IonCheckbox>
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img src={house} style={{ height: "2.75vh" }} />
              }
            </IonItem>
            <IonItem lines="none" mode="ios">
              <IonLabel>Dining</IonLabel>
              <IonCheckbox
                id="diningCheckbox"
                checked={diningChecked}
                slot="start"
                onIonChange={(e) => {
                  handleCheckboxChange("dining");
                  setDiningChecked(e.detail.checked);
                  if (e.detail.checked) setCheckboxSelection("dining");
                }}
              ></IonCheckbox>
              {schoolName && schoolName === "Cal Poly Humboldt" && schoolColorToggled &&
                <img src={ozzie} style={{ height: "2vh", transform: "translateX(2.5%)" }} />
              }
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
              color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
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
                    color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                    mode="ios"
                    onClick={() => {
                      setPhoto([]);
                      setBlob([]);
                      setPostClassName("");
                      setPostClassNumber("");
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
            <IonCard >
              {/* <div> */}
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
                        spellcheck={true}
                        ref={inputRef}
                        rows={4}
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
              <br /> <br /> <br />
              <IonRow>
                {schoolName && schoolName === "Cal Poly Humboldt" &&
                  <IonFab horizontal="start" style={{
                    textAlign: "center", alignItems: "center",
                    alignSelf: "center", display: "flex", paddingTop: ""
                  }}>
                    <IonItem mode="ios">
                      <IonSelect
                        interface="action-sheet"
                        interfaceOptions={selectOptions}
                        okText="Select"
                        cancelText="Cancel"
                        mode="ios"
                        value={postClassName}
                        placeholder="Class: "
                        onIonChange={(e: any) => {
                          setPostClassNumber("");
                          setPostClassName(e.detail.value);
                        }}
                      >
                        <IonSelectOption value="AIE" class="all-option">AIE</IonSelectOption>
                        <IonSelectOption value="ANTH" class="all-option">ANTH</IonSelectOption>
                        <IonSelectOption value="ART" class="all-option">ART</IonSelectOption>
                        <IonSelectOption value="AHSS" class="all-option">AHSS</IonSelectOption>
                        <IonSelectOption value="BIOL" class="all-option">BIOL</IonSelectOption>
                        <IonSelectOption value="BOT" class="all-option">BOT</IonSelectOption>
                        <IonSelectOption value="BA" class="all-option">BA</IonSelectOption>
                        <IonSelectOption value="CHEM" class="all-option">CHEM</IonSelectOption>
                        <IonSelectOption value="CD" class="all-option">CD</IonSelectOption>
                        <IonSelectOption value="COMM" class="all-option">COMM</IonSelectOption>
                        <IonSelectOption value="CS" class="all-option">CS</IonSelectOption>
                        <IonSelectOption value="CRIM" class="all-option">CRIM</IonSelectOption>
                        <IonSelectOption value="CRGS" class="all-option">CRGS</IonSelectOption>
                        <IonSelectOption value="DANC" class="all-option">DANC</IonSelectOption>
                        <IonSelectOption value="ECON" class="all-option">ECON</IonSelectOption>
                        <IonSelectOption value="EDUC" class="all-option">EDUC</IonSelectOption>
                        <IonSelectOption value="EDL" class="all-option">EDL</IonSelectOption>
                        <IonSelectOption value="ENGR" class="all-option">ENGR</IonSelectOption>
                        <IonSelectOption value="ENGL" class="all-option">ENGL</IonSelectOption>
                        <IonSelectOption value="ESM" class="all-option">ESM</IonSelectOption>
                        <IonSelectOption value="ENST" class="all-option">ENST</IonSelectOption>
                        <IonSelectOption value="ES" class="all-option">ES</IonSelectOption>
                        <IonSelectOption value="FILM" class="all-option">FILM</IonSelectOption>
                        <IonSelectOption value="FISH" class="all-option">FISH</IonSelectOption>
                        <IonSelectOption value="FOR" class="all-option">FOR</IonSelectOption>
                        <IonSelectOption value="FREN" class="all-option">FREN</IonSelectOption>
                        <IonSelectOption value="GEOG" class="all-option">GEOG</IonSelectOption>
                        <IonSelectOption value="GEOL" class="all-option">GEOL</IonSelectOption>
                        <IonSelectOption value="GSP" class="all-option">GSP</IonSelectOption>
                        <IonSelectOption value="GERM" class="all-option">GERM</IonSelectOption>
                        <IonSelectOption value="HED" class="all-option">HED</IonSelectOption>
                        <IonSelectOption value="HIST" class="all-option">HIST</IonSelectOption>
                        <IonSelectOption value="JMC" class="all-option">JMC</IonSelectOption>
                        <IonSelectOption value="KINS" class="all-option">KINS</IonSelectOption>
                        <IonSelectOption value="MATH" class="all-option">MATH</IonSelectOption>
                        <IonSelectOption value="MUS" class="all-option">MUS</IonSelectOption>
                        <IonSelectOption value="NAS" class="all-option">NAS</IonSelectOption>
                        <IonSelectOption value="OCN" class="all-option">OCN</IonSelectOption>
                        <IonSelectOption value="PHIL" class="all-option">PHIL</IonSelectOption>
                        <IonSelectOption value="PSCI" class="all-option">PSCI</IonSelectOption>
                        <IonSelectOption value="PSYC" class="all-option">PYSC</IonSelectOption>
                        <IonSelectOption value="RS" class="all-option">RS</IonSelectOption>
                        <IonSelectOption value="SPAN" class="all-option">SPAN</IonSelectOption>
                        <IonSelectOption value="STAT" class="all-option">STAT</IonSelectOption>
                        <IonSelectOption value="TA" class="all-option">TA</IonSelectOption>
                        <IonSelectOption value="WLDF" class="all-option">WLDF</IonSelectOption>
                        <IonSelectOption value="WS" class="all-option">WS</IonSelectOption>
                        <IonSelectOption value="ZOOL" class="all-option">ZOOL</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    {postClassName && postClassName.length > 0 &&
                      <IonItem>
                        <IonSelect
                          interface="action-sheet"
                          interfaceOptions={selectOptionsNumber}
                          okText="Select"
                          cancelText="Cancel"
                          mode="ios"
                          value={postClassNumber}
                          placeholder="#:"
                          onIonChange={(e: any) => {
                            setPostClassNumber(e.detail.value);
                          }}
                        >
                          <>
                            {postClassName === 'AIE' ?
                              <>
                                <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                              </>
                              : postClassName === 'ANTH' ?
                                <>
                                  <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                  <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                  <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                  <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                  <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                  <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                  <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                  <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                                  <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                  <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                                  <IonSelectOption value="339" class="all-option">339</IonSelectOption>
                                  <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                  <IonSelectOption value="357" class="all-option">357</IonSelectOption>
                                  <IonSelectOption value="358" class="all-option">358</IonSelectOption>
                                  <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                  <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                </>
                                : postClassName === 'ART' ?
                                  <>
                                    <IonSelectOption value="103A" class="all-option">103A</IonSelectOption>
                                    <IonSelectOption value="103AB" class="all-option">103B</IonSelectOption>
                                    <IonSelectOption value="104I" class="all-option">104I</IonSelectOption>
                                    <IonSelectOption value="104J" class="all-option">104J</IonSelectOption>
                                    <IonSelectOption value="105B" class="all-option">105B</IonSelectOption>
                                    <IonSelectOption value="105C" class="all-option">105C</IonSelectOption>
                                    <IonSelectOption value="105D" class="all-option">105D</IonSelectOption>
                                    <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                    <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                    <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                    <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                    <IonSelectOption value="122" class="all-option">122</IonSelectOption>
                                    <IonSelectOption value="250" class="all-option">250</IonSelectOption>
                                    <IonSelectOption value="251" class="all-option">251</IonSelectOption>
                                    <IonSelectOption value="273" class="all-option">273</IonSelectOption>
                                    <IonSelectOption value="282" class="all-option">282</IonSelectOption>
                                    <IonSelectOption value="290" class="all-option">290</IonSelectOption>
                                    <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                    <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                    <IonSelectOption value="303M" class="all-option">303M</IonSelectOption>
                                    <IonSelectOption value="304" class="all-option">304</IonSelectOption>
                                    <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                    <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                                    <IonSelectOption value="321" class="all-option">321</IonSelectOption>
                                    <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                                    <IonSelectOption value="326" class="all-option">326</IonSelectOption>
                                    <IonSelectOption value="329" class="all-option">329</IonSelectOption>
                                    <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                    <IonSelectOption value="337" class="all-option">337</IonSelectOption>
                                    <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                    <IonSelectOption value="346" class="all-option">346</IonSelectOption>
                                    <IonSelectOption value="348" class="all-option">348</IonSelectOption>
                                    <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                    <IonSelectOption value="351" class="all-option">351</IonSelectOption>
                                    <IonSelectOption value="356" class="all-option">356</IonSelectOption>
                                    <IonSelectOption value="356M" class="all-option">356M</IonSelectOption>
                                    <IonSelectOption value="357B" class="all-option">357B</IonSelectOption>
                                    <IonSelectOption value="359" class="all-option">359</IonSelectOption>
                                    <IonSelectOption value="367" class="all-option">367</IonSelectOption>
                                    <IonSelectOption value="372" class="all-option">372</IonSelectOption>
                                    <IonSelectOption value="395" class="all-option">395</IonSelectOption>
                                    <IonSelectOption value="437" class="all-option">437</IonSelectOption>
                                    <IonSelectOption value="491A" class="all-option">491A</IonSelectOption>
                                    <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                  </>
                                  : postClassName === 'AHSS' ?
                                    <>
                                      <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                      <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                      <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                                      <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                      <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                      <IonSelectOption value="180" class="all-option">180</IonSelectOption>
                                    </>
                                    : postClassName === 'BIOL' ?
                                      <>
                                        <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                                        <IonSelectOption value="102L" class="all-option">102L</IonSelectOption>
                                        <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                        <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                        <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                        <IonSelectOption value="255" class="all-option">255</IonSelectOption>
                                        <IonSelectOption value="304" class="all-option">304</IonSelectOption>
                                        <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                                        <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                        <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                        <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                        <IonSelectOption value="412" class="all-option">412</IonSelectOption>
                                        <IonSelectOption value="433" class="all-option">433</IonSelectOption>
                                        <IonSelectOption value="433D" class="all-option">433D</IonSelectOption>
                                        <IonSelectOption value="434" class="all-option">434</IonSelectOption>
                                        <IonSelectOption value="440" class="all-option">440</IonSelectOption>
                                        <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                                        <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                        <IonSelectOption value="480L" class="all-option">480L</IonSelectOption>
                                        <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                        <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                        <IonSelectOption value="533" class="all-option">533</IonSelectOption>
                                        <IonSelectOption value="533D" class="all-option">533D</IonSelectOption>
                                        <IonSelectOption value="534" class="all-option">534</IonSelectOption>
                                        <IonSelectOption value="580" class="all-option">580</IonSelectOption>
                                        <IonSelectOption value="597" class="all-option">597</IonSelectOption>
                                        <IonSelectOption value="683" class="all-option">683</IonSelectOption>
                                        <IonSelectOption value="685" class="all-option">685</IonSelectOption>
                                        <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                                        <IonSelectOption value="699" class="all-option">699</IonSelectOption>
                                      </>
                                      : postClassName === 'BOT' ?
                                        <>
                                          <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                          <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                          <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                          <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                          <IonSelectOption value="330L" class="all-option">330L</IonSelectOption>
                                          <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                          <IonSelectOption value="354" class="all-option">354</IonSelectOption>
                                          <IonSelectOption value="354A" class="all-option">354A</IonSelectOption>
                                          <IonSelectOption value="358" class="all-option">358</IonSelectOption>
                                          <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                          <IonSelectOption value="360L" class="all-option">360L</IonSelectOption>
                                        </>
                                        : postClassName === 'BA' ?
                                          <>
                                            <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                            <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                            <IonSelectOption value="202" class="all-option">202</IonSelectOption>
                                            <IonSelectOption value="250" class="all-option">250</IonSelectOption>
                                            <IonSelectOption value="252" class="all-option">252</IonSelectOption>
                                            <IonSelectOption value="322" class="all-option">322</IonSelectOption>
                                            <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                            <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                            <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                            <IonSelectOption value="422" class="all-option">422</IonSelectOption>
                                            <IonSelectOption value="430" class="all-option">430</IonSelectOption>
                                            <IonSelectOption value="432" class="all-option">432</IonSelectOption>
                                            <IonSelectOption value="433" class="all-option">433</IonSelectOption>
                                            <IonSelectOption value="446" class="all-option">446</IonSelectOption>
                                            <IonSelectOption value="449" class="all-option">449</IonSelectOption>
                                            <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                                            <IonSelectOption value="453" class="all-option">453</IonSelectOption>
                                            <IonSelectOption value="454" class="all-option">454</IonSelectOption>
                                            <IonSelectOption value="456" class="all-option">456</IonSelectOption>
                                            <IonSelectOption value="462" class="all-option">462</IonSelectOption>
                                            <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                            <IonSelectOption value="496" class="all-option">496</IonSelectOption>
                                          </>
                                          : postClassName === 'CHEM' ?
                                            <>
                                              <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                              <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                              <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                              <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                              <IonSelectOption value="228" class="all-option">228</IonSelectOption>
                                              <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                                              <IonSelectOption value="324L" class="all-option">324L</IonSelectOption>
                                              <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                              <IonSelectOption value="341" class="all-option">341</IonSelectOption>
                                              <IonSelectOption value="361" class="all-option">361</IonSelectOption>
                                              <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                              <IonSelectOption value="434" class="all-option">434</IonSelectOption>
                                              <IonSelectOption value="434L" class="all-option">434L</IonSelectOption>
                                              <IonSelectOption value="438" class="all-option">438</IonSelectOption>
                                              <IonSelectOption value="485" class="all-option">485</IonSelectOption>
                                            </>
                                            : postClassName === 'CD' ?
                                              <>
                                                <IonSelectOption value="109Y" class="all-option">109Y</IonSelectOption>
                                                <IonSelectOption value="109Z" class="all-option">109Z</IonSelectOption>
                                                <IonSelectOption value="209" class="all-option">209</IonSelectOption>
                                                <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                                <IonSelectOption value="211S" class="all-option">211S</IonSelectOption>
                                                <IonSelectOption value="251" class="all-option">251</IonSelectOption>
                                                <IonSelectOption value="253" class="all-option">253</IonSelectOption>
                                                <IonSelectOption value="257" class="all-option">257</IonSelectOption>
                                                <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                                <IonSelectOption value="355" class="all-option">355</IonSelectOption>
                                                <IonSelectOption value="362" class="all-option">362</IonSelectOption>
                                                <IonSelectOption value="366" class="all-option">366</IonSelectOption>
                                                <IonSelectOption value="467" class="all-option">467</IonSelectOption>
                                                <IonSelectOption value="469" class="all-option">469</IonSelectOption>
                                                <IonSelectOption value="479" class="all-option">479</IonSelectOption>
                                                <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                              </>
                                              : postClassName === 'COMM' ?
                                                <>
                                                  <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                  <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                                  <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                  <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                  <IonSelectOption value="214" class="all-option">214</IonSelectOption>
                                                  <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                                  <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                  <IonSelectOption value="309B" class="all-option">309B</IonSelectOption>
                                                  <IonSelectOption value="319" class="all-option">319</IonSelectOption>
                                                  <IonSelectOption value="411" class="all-option">411</IonSelectOption>
                                                  <IonSelectOption value="414" class="all-option">414</IonSelectOption>
                                                  <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                  <IonSelectOption value="490" class="all-option">490</IonSelectOption>
                                                </>
                                                : postClassName === 'CS' ?
                                                  <>
                                                    <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                    <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                                    <IonSelectOption value="112" class="all-option">112</IonSelectOption>
                                                    <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                                    <IonSelectOption value="243" class="all-option">243</IonSelectOption>
                                                    <IonSelectOption value="279" class="all-option">279</IonSelectOption>
                                                    <IonSelectOption value="309" class="all-option">309</IonSelectOption>
                                                    <IonSelectOption value="312" class="all-option">312</IonSelectOption>
                                                    <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                    <IonSelectOption value="346" class="all-option">346</IonSelectOption>
                                                    <IonSelectOption value="374" class="all-option">374</IonSelectOption>
                                                    <IonSelectOption value="458" class="all-option">458</IonSelectOption>
                                                    <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                  </>
                                                  : postClassName === 'CRIM' ?
                                                    <>
                                                      <IonSelectOption value="125" class="all-option">125</IonSelectOption>
                                                      <IonSelectOption value="225" class="all-option">225</IonSelectOption>
                                                      <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                      <IonSelectOption value="362" class="all-option">362</IonSelectOption>
                                                      <IonSelectOption value="410" class="all-option">410</IonSelectOption>
                                                      <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                    </>
                                                    : postClassName === 'CRGS' ?
                                                      <>
                                                        <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                        <IonSelectOption value="118" class="all-option">118</IonSelectOption>
                                                        <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                                        <IonSelectOption value="313" class="all-option">313</IonSelectOption>
                                                        <IonSelectOption value="331" class="all-option">331</IonSelectOption>
                                                        <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                                        <IonSelectOption value="390" class="all-option">390</IonSelectOption>
                                                        <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                                        <IonSelectOption value="491" class="all-option">491</IonSelectOption>
                                                      </>
                                                      : postClassName === 'DANC' ?
                                                        <>
                                                          <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                                          <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                          <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                          <IonSelectOption value="243" class="all-option">243</IonSelectOption>
                                                          <IonSelectOption value="245" class="all-option">245</IonSelectOption>
                                                          <IonSelectOption value="247" class="all-option">247</IonSelectOption>
                                                          <IonSelectOption value="248" class="all-option">248</IonSelectOption>
                                                          <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                          <IonSelectOption value="320" class="all-option">320</IonSelectOption>
                                                          <IonSelectOption value="352" class="all-option">352</IonSelectOption>
                                                          <IonSelectOption value="354" class="all-option">354</IonSelectOption>
                                                          <IonSelectOption value="389" class="all-option">389</IonSelectOption>
                                                          <IonSelectOption value="488" class="all-option">488</IonSelectOption>
                                                          <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                                        </>
                                                        : postClassName === 'ECON' ?
                                                          <>
                                                            <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                            <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                            <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                            <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                            <IonSelectOption value="423" class="all-option">423</IonSelectOption>
                                                            <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                            <IonSelectOption value="550" class="all-option">550</IonSelectOption>
                                                          </>
                                                          : postClassName === 'EDUC' ?
                                                            <>
                                                              <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                                              <IonSelectOption value="377" class="all-option">377</IonSelectOption>
                                                              <IonSelectOption value="610" class="all-option">610</IonSelectOption>
                                                              <IonSelectOption value="620" class="all-option">620</IonSelectOption>

                                                            </>
                                                            : postClassName === 'EDL' ?
                                                              <>
                                                                <IonSelectOption value="645" class="all-option">645</IonSelectOption>
                                                                <IonSelectOption value="646" class="all-option">646</IonSelectOption>
                                                                <IonSelectOption value="649" class="all-option">649</IonSelectOption>
                                                                <IonSelectOption value="660" class="all-option">660</IonSelectOption>
                                                                <IonSelectOption value="694" class="all-option">694</IonSelectOption>
                                                                <IonSelectOption value="695" class="all-option">695</IonSelectOption>
                                                              </>
                                                              : postClassName === 'ENGR' ?
                                                                <>
                                                                  <IonSelectOption value="115" class="all-option">115</IonSelectOption>
                                                                  <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                  <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                                                  <IonSelectOption value="215" class="all-option">215</IonSelectOption>
                                                                  <IonSelectOption value="225" class="all-option">225</IonSelectOption>
                                                                  <IonSelectOption value="280" class="all-option">280</IonSelectOption>
                                                                  <IonSelectOption value="299" class="all-option">299</IonSelectOption>
                                                                  <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                                  <IonSelectOption value="313" class="all-option">313</IonSelectOption>
                                                                  <IonSelectOption value="322" class="all-option">322</IonSelectOption>
                                                                  <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                                  <IonSelectOption value="326" class="all-option">326</IonSelectOption>
                                                                  <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                                                  <IonSelectOption value="331" class="all-option">331</IonSelectOption>
                                                                  <IonSelectOption value="333" class="all-option">333</IonSelectOption>
                                                                  <IonSelectOption value="351" class="all-option">351</IonSelectOption>
                                                                  <IonSelectOption value="371" class="all-option">371</IonSelectOption>
                                                                  <IonSelectOption value="399" class="all-option">399</IonSelectOption>
                                                                  <IonSelectOption value="410" class="all-option">410</IonSelectOption>
                                                                  <IonSelectOption value="416" class="all-option">416</IonSelectOption>
                                                                  <IonSelectOption value="418" class="all-option">418</IonSelectOption>
                                                                  <IonSelectOption value="440" class="all-option">440</IonSelectOption>
                                                                  <IonSelectOption value="453" class="all-option">453</IonSelectOption>
                                                                  <IonSelectOption value="471" class="all-option">471</IonSelectOption>
                                                                  <IonSelectOption value="492" class="all-option">492</IonSelectOption>
                                                                  <IonSelectOption value="496" class="all-option">496</IonSelectOption>
                                                                  <IonSelectOption value="498" class="all-option">498</IonSelectOption>
                                                                  <IonSelectOption value="518" class="all-option">518</IonSelectOption>
                                                                  <IonSelectOption value="532" class="all-option">532</IonSelectOption>
                                                                  <IonSelectOption value="571" class="all-option">571</IonSelectOption>
                                                                  <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                                                                </>
                                                                : postClassName === 'ENGL' ?
                                                                  <>
                                                                    <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                                                                    <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                                                    <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                    <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                    <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                    <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                                                    <IonSelectOption value="218" class="all-option">218</IonSelectOption>
                                                                    <IonSelectOption value="220" class="all-option">220</IonSelectOption>
                                                                    <IonSelectOption value="240" class="all-option">240</IonSelectOption>
                                                                    <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                    <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                    <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                                                                    <IonSelectOption value="328" class="all-option">328</IonSelectOption>
                                                                    <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                                    <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                                                    <IonSelectOption value="406" class="all-option">406</IonSelectOption>
                                                                    <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                                    <IonSelectOption value="426" class="all-option">426</IonSelectOption>
                                                                    <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                                    <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                                                                    <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                                    <IonSelectOption value="535" class="all-option">535</IonSelectOption>
                                                                    <IonSelectOption value="600" class="all-option">600</IonSelectOption>
                                                                  </>
                                                                  : postClassName === 'ESM' ?
                                                                    <>
                                                                      <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                      <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                                      <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                      <IonSelectOption value="230" class="all-option">230</IonSelectOption>
                                                                      <IonSelectOption value="253" class="all-option">253</IonSelectOption>
                                                                      <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                                      <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                      <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                                      <IonSelectOption value="309B" class="all-option">309B</IonSelectOption>
                                                                      <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                                      <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                                                      <IonSelectOption value="355" class="all-option">355</IonSelectOption>
                                                                      <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                                                      <IonSelectOption value="411" class="all-option">411</IonSelectOption>
                                                                      <IonSelectOption value="425" class="all-option">425</IonSelectOption>
                                                                      <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                                      <IonSelectOption value="450" class="all-option">450</IonSelectOption>
                                                                      <IonSelectOption value="455" class="all-option">455</IonSelectOption>
                                                                      <IonSelectOption value="462" class="all-option">462</IonSelectOption>
                                                                    </>
                                                                    : postClassName === 'ENST' ?
                                                                      <>
                                                                        <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                                        <IonSelectOption value="123" class="all-option">123</IonSelectOption>
                                                                        <IonSelectOption value="395" class="all-option">395</IonSelectOption>
                                                                        <IonSelectOption value="490S" class="all-option">490S</IonSelectOption>
                                                                      </>
                                                                      : postClassName === 'ES' ?
                                                                        <>
                                                                          <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                          <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                          <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                          <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                          <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                          <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                                          <IonSelectOption value="317" class="all-option">317</IonSelectOption>
                                                                          <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                                        </>
                                                                        : postClassName === 'FILM' ?
                                                                          <>
                                                                            <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                            <IonSelectOption value="260" class="all-option">260</IonSelectOption>
                                                                            <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                            <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                            <IonSelectOption value="317" class="all-option">317</IonSelectOption>
                                                                            <IonSelectOption value="350" class="all-option">350</IonSelectOption>
                                                                            <IonSelectOption value="378" class="all-option">378</IonSelectOption>
                                                                            <IonSelectOption value="415" class="all-option">415</IonSelectOption>
                                                                            <IonSelectOption value="465" class="all-option">465</IonSelectOption>
                                                                          </>
                                                                          : postClassName === 'FISH' ?
                                                                            <>
                                                                              <IonSelectOption value="260" class="all-option">260</IonSelectOption>
                                                                              <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                              <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                              <IonSelectOption value="314" class="all-option">314</IonSelectOption>
                                                                              <IonSelectOption value="375" class="all-option">375</IonSelectOption>
                                                                              <IonSelectOption value="380" class="all-option">380</IonSelectOption>
                                                                              <IonSelectOption value="435" class="all-option">435</IonSelectOption>
                                                                              <IonSelectOption value="476" class="all-option">476</IonSelectOption>
                                                                              <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                                              <IonSelectOption value="576" class="all-option">576</IonSelectOption>
                                                                              <IonSelectOption value="580" class="all-option">580</IonSelectOption>
                                                                              <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                                                                              <IonSelectOption value="695" class="all-option">695</IonSelectOption>
                                                                            </>
                                                                            : postClassName === 'FOR' ?
                                                                              <>
                                                                                <IonSelectOption value="170" class="all-option">170</IonSelectOption>
                                                                                <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                <IonSelectOption value="223" class="all-option">223</IonSelectOption>
                                                                                <IonSelectOption value="250" class="all-option">250</IonSelectOption>
                                                                                <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                                <IonSelectOption value="321" class="all-option">321</IonSelectOption>
                                                                                <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                                <IonSelectOption value="353" class="all-option">353</IonSelectOption>
                                                                                <IonSelectOption value="359" class="all-option">359</IonSelectOption>
                                                                                <IonSelectOption value="374" class="all-option">374</IonSelectOption>
                                                                                <IonSelectOption value="424" class="all-option">424</IonSelectOption>
                                                                                <IonSelectOption value="430" class="all-option">430</IonSelectOption>
                                                                                <IonSelectOption value="432" class="all-option">432</IonSelectOption>
                                                                                <IonSelectOption value="471" class="all-option">471</IonSelectOption>
                                                                                <IonSelectOption value="475" class="all-option">475</IonSelectOption>
                                                                                <IonSelectOption value="479" class="all-option">479</IonSelectOption>
                                                                                <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                                                <IonSelectOption value="490" class="all-option">490</IonSelectOption>
                                                                                <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                                                                <IonSelectOption value="530" class="all-option">530</IonSelectOption>
                                                                                <IonSelectOption value="532" class="all-option">532</IonSelectOption>
                                                                                <IonSelectOption value="680" class="all-option">680</IonSelectOption>
                                                                              </>
                                                                              : postClassName === 'FREN' ?
                                                                                <>
                                                                                  <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                                  <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                  <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                  <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                  <IonSelectOption value="207" class="all-option">207</IonSelectOption>
                                                                                  <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                  <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                  <IonSelectOption value="390" class="all-option">390</IonSelectOption>
                                                                                  <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                                                </>
                                                                                : postClassName === 'GEOG' ?
                                                                                  <>
                                                                                    <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                    <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                    <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                                    <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                                    <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                    <IonSelectOption value="352" class="all-option">352</IonSelectOption>
                                                                                  </>
                                                                                  : postClassName === 'GSP' ?
                                                                                    <>
                                                                                      <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                                                                      <IonSelectOption value="216" class="all-option">216</IonSelectOption>
                                                                                      <IonSelectOption value="270" class="all-option">270</IonSelectOption>
                                                                                      <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                                                                                      <IonSelectOption value="326" class="all-option">326</IonSelectOption>
                                                                                      <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                      <IonSelectOption value="416" class="all-option">416</IonSelectOption>
                                                                                    </>
                                                                                    : postClassName === 'GERM' ?
                                                                                      <>
                                                                                        <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                        <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                        <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                      </>
                                                                                      : postClassName === 'HED' ?
                                                                                        <>
                                                                                          <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                                          <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                                                          <IonSelectOption value="231" class="all-option">231</IonSelectOption>
                                                                                          <IonSelectOption value="342" class="all-option">342</IonSelectOption>
                                                                                          <IonSelectOption value="345" class="all-option">345</IonSelectOption>
                                                                                          <IonSelectOption value="392" class="all-option">392</IonSelectOption>
                                                                                          <IonSelectOption value="446" class="all-option">446</IonSelectOption>
                                                                                          <IonSelectOption value="451" class="all-option">451</IonSelectOption>
                                                                                          <IonSelectOption value="495" class="all-option">495</IonSelectOption>
                                                                                        </>
                                                                                        : postClassName === 'HIST' ?
                                                                                          <>
                                                                                            <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                            <IonSelectOption value="106B" class="all-option">16B5</IonSelectOption>
                                                                                            <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                            <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                            <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                                                                            <IonSelectOption value="200" class="all-option">200</IonSelectOption>
                                                                                            <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                            <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                                            <IonSelectOption value="338" class="all-option">338</IonSelectOption>
                                                                                            <IonSelectOption value="342" class="all-option">342</IonSelectOption>
                                                                                            <IonSelectOption value="372" class="all-option">372</IonSelectOption>
                                                                                            <IonSelectOption value="397" class="all-option">397</IonSelectOption>
                                                                                            <IonSelectOption value="398" class="all-option">398</IonSelectOption>
                                                                                            <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                                                            <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                                                                            <IonSelectOption value="491" class="all-option">491</IonSelectOption>
                                                                                          </>
                                                                                          : postClassName === 'JMC' ?
                                                                                            <>
                                                                                              <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                              <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                                                              <IonSelectOption value="134" class="all-option">134</IonSelectOption>
                                                                                              <IonSelectOption value="154" class="all-option">154</IonSelectOption>
                                                                                              <IonSelectOption value="155" class="all-option">155</IonSelectOption>
                                                                                              <IonSelectOption value="156" class="all-option">156</IonSelectOption>
                                                                                              <IonSelectOption value="160" class="all-option">160</IonSelectOption>
                                                                                              <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                              <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                              <IonSelectOption value="309" class="all-option">309</IonSelectOption>
                                                                                              <IonSelectOption value="318" class="all-option">318</IonSelectOption>
                                                                                              <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                                              <IonSelectOption value="325" class="all-option">325</IonSelectOption>
                                                                                              <IonSelectOption value="327" class="all-option">327</IonSelectOption>
                                                                                              <IonSelectOption value="355" class="all-option">355</IonSelectOption>
                                                                                              <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                                                                              <IonSelectOption value="427" class="all-option">427</IonSelectOption>
                                                                                              <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                                                                            </>
                                                                                            : postClassName === 'KINS' ?
                                                                                              <>
                                                                                                <IonSelectOption value="165" class="all-option">165</IonSelectOption>
                                                                                                <IonSelectOption value="244" class="all-option">244</IonSelectOption>
                                                                                                <IonSelectOption value="288" class="all-option">288</IonSelectOption>
                                                                                                <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                                                <IonSelectOption value="339" class="all-option">339</IonSelectOption>
                                                                                                <IonSelectOption value="379" class="all-option">379</IonSelectOption>
                                                                                                <IonSelectOption value="384" class="all-option">384</IonSelectOption>
                                                                                                <IonSelectOption value="385" class="all-option">385</IonSelectOption>
                                                                                                <IonSelectOption value="386" class="all-option">386</IonSelectOption>
                                                                                                <IonSelectOption value="425" class="all-option">425</IonSelectOption>
                                                                                                <IonSelectOption value="456A" class="all-option">456A</IonSelectOption>
                                                                                                <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                                                                <IonSelectOption value="474" class="all-option">474</IonSelectOption>
                                                                                                <IonSelectOption value="482" class="all-option">482</IonSelectOption>
                                                                                              </>
                                                                                              : postClassName === 'MATH' ?
                                                                                                <>
                                                                                                  <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                                                                                  <IonSelectOption value="101I" class="all-option">101I</IonSelectOption>
                                                                                                  <IonSelectOption value="101T" class="all-option">101T</IonSelectOption>
                                                                                                  <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                                                                                                  <IonSelectOption value="103" class="all-option">103</IonSelectOption>
                                                                                                  <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                                  <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                  <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                                  <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                                  <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                                  <IonSelectOption value="245" class="all-option">245</IonSelectOption>
                                                                                                  <IonSelectOption value="253" class="all-option">253</IonSelectOption>
                                                                                                  <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                                  <IonSelectOption value="315" class="all-option">315</IonSelectOption>
                                                                                                  <IonSelectOption value="381" class="all-option">381</IonSelectOption>
                                                                                                  <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                                                                </>
                                                                                                : postClassName === 'MUS' ?
                                                                                                  <>
                                                                                                    <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                    <IonSelectOption value="106B" class="all-option">106B</IonSelectOption>
                                                                                                    <IonSelectOption value="106E" class="all-option">106E</IonSelectOption>
                                                                                                    <IonSelectOption value="106F" class="all-option">106F</IonSelectOption>
                                                                                                    <IonSelectOption value="106H" class="all-option">106H</IonSelectOption>
                                                                                                    <IonSelectOption value="106J" class="all-option">106J</IonSelectOption>
                                                                                                    <IonSelectOption value="106K" class="all-option">106K</IonSelectOption>
                                                                                                    <IonSelectOption value="106N" class="all-option">106N</IonSelectOption>
                                                                                                    <IonSelectOption value="106O" class="all-option">106O</IonSelectOption>
                                                                                                    <IonSelectOption value="107C" class="all-option">107C</IonSelectOption>
                                                                                                    <IonSelectOption value="107F" class="all-option">107F</IonSelectOption>
                                                                                                    <IonSelectOption value="107G" class="all-option">107G</IonSelectOption>
                                                                                                    <IonSelectOption value="107I" class="all-option">107I</IonSelectOption>
                                                                                                    <IonSelectOption value="107J" class="all-option">107J</IonSelectOption>
                                                                                                    <IonSelectOption value="107P" class="all-option">107P</IonSelectOption>
                                                                                                    <IonSelectOption value="107Q" class="all-option">107Q</IonSelectOption>
                                                                                                    <IonSelectOption value="107T" class="all-option">107T</IonSelectOption>
                                                                                                    <IonSelectOption value="108G" class="all-option">108G</IonSelectOption>
                                                                                                    <IonSelectOption value="108K" class="all-option">108K</IonSelectOption>
                                                                                                    <IonSelectOption value="108P" class="all-option">108P</IonSelectOption>
                                                                                                    <IonSelectOption value="108T" class="all-option">108T</IonSelectOption>
                                                                                                    <IonSelectOption value="108V" class="all-option">108V</IonSelectOption>
                                                                                                    <IonSelectOption value="108G" class="all-option">108G</IonSelectOption>
                                                                                                    <IonSelectOption value="109G" class="all-option">109G</IonSelectOption>
                                                                                                    <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                                    <IonSelectOption value="112" class="all-option">112</IonSelectOption>
                                                                                                    <IonSelectOption value="130" class="all-option">130</IonSelectOption>
                                                                                                    <IonSelectOption value="180" class="all-option">180</IonSelectOption>
                                                                                                    <IonSelectOption value="215" class="all-option">215</IonSelectOption>
                                                                                                    <IonSelectOption value="217" class="all-option">217</IonSelectOption>
                                                                                                    <IonSelectOption value="220" class="all-option">220</IonSelectOption>
                                                                                                    <IonSelectOption value="221" class="all-option">221</IonSelectOption>
                                                                                                    <IonSelectOption value="222" class="all-option">222</IonSelectOption>
                                                                                                    <IonSelectOption value="223" class="all-option">223</IonSelectOption>
                                                                                                    <IonSelectOption value="224" class="all-option">224</IonSelectOption>
                                                                                                    <IonSelectOption value="225" class="all-option">225</IonSelectOption>
                                                                                                    <IonSelectOption value="226" class="all-option">226</IonSelectOption>
                                                                                                    <IonSelectOption value="227" class="all-option">227</IonSelectOption>
                                                                                                    <IonSelectOption value="228" class="all-option">228</IonSelectOption>
                                                                                                    <IonSelectOption value="229" class="all-option">229</IonSelectOption>
                                                                                                    <IonSelectOption value="230" class="all-option">230</IonSelectOption>
                                                                                                    <IonSelectOption value="231" class="all-option">231</IonSelectOption>
                                                                                                    <IonSelectOption value="232" class="all-option">232</IonSelectOption>
                                                                                                    <IonSelectOption value="233" class="all-option">233</IonSelectOption>
                                                                                                    <IonSelectOption value="234" class="all-option">234</IonSelectOption>
                                                                                                    <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                                                                                    <IonSelectOption value="236" class="all-option">236</IonSelectOption>
                                                                                                    <IonSelectOption value="237" class="all-option">237</IonSelectOption>
                                                                                                    <IonSelectOption value="238" class="all-option">238</IonSelectOption>
                                                                                                    <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                                                                                    <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                                    <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                                                    <IonSelectOption value="314" class="all-option">314</IonSelectOption>
                                                                                                    <IonSelectOption value="316" class="all-option">316</IonSelectOption>
                                                                                                    <IonSelectOption value="319" class="all-option">319</IonSelectOption>
                                                                                                    <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                                                                                                    <IonSelectOption value="330" class="all-option">330</IonSelectOption>
                                                                                                    <IonSelectOption value="334" class="all-option">334</IonSelectOption>
                                                                                                    <IonSelectOption value="338" class="all-option">338</IonSelectOption>
                                                                                                    <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                                    <IonSelectOption value="348" class="all-option">348</IonSelectOption>
                                                                                                    <IonSelectOption value="353" class="all-option">353</IonSelectOption>
                                                                                                    <IonSelectOption value="361" class="all-option">361</IonSelectOption>
                                                                                                  </>
                                                                                                  : postClassName === 'NAS' ?
                                                                                                    <>
                                                                                                      <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                      <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                      <IonSelectOption value="200" class="all-option">200</IonSelectOption>
                                                                                                      <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                                      <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                                      <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                                                                                                      <IonSelectOption value="331" class="all-option">331</IonSelectOption>
                                                                                                      <IonSelectOption value="332" class="all-option">332</IonSelectOption>
                                                                                                      <IonSelectOption value="333" class="all-option">333</IonSelectOption>
                                                                                                      <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                                      <IonSelectOption value="364" class="all-option">364</IonSelectOption>
                                                                                                    </>
                                                                                                    : postClassName === 'OCN' ?
                                                                                                      <>
                                                                                                        <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                                        <IonSelectOption value="260" class="all-option">260</IonSelectOption>
                                                                                                        <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                                                                                        <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                                                        <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                                        <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                                        <IonSelectOption value="496" class="all-option">496</IonSelectOption>
                                                                                                      </>
                                                                                                      : postClassName === 'PHIL' ?
                                                                                                        <>
                                                                                                          <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                                                          <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                          <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                                          <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                          <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                                                                                          <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                                          <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                                          <IonSelectOption value="304" class="all-option">304</IonSelectOption>
                                                                                                          <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                                          <IonSelectOption value="307" class="all-option">307</IonSelectOption>
                                                                                                          <IonSelectOption value="371" class="all-option">371</IonSelectOption>
                                                                                                          <IonSelectOption value="420" class="all-option">420</IonSelectOption>
                                                                                                          <IonSelectOption value="480" class="all-option">480</IonSelectOption>
                                                                                                        </>
                                                                                                        : postClassName === 'PSCI' ?
                                                                                                          <>
                                                                                                            <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                                            <IonSelectOption value="159" class="all-option">159</IonSelectOption>
                                                                                                            <IonSelectOption value="220" class="all-option">220</IonSelectOption>
                                                                                                            <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                                                                                            <IonSelectOption value="240" class="all-option">240</IonSelectOption>
                                                                                                            <IonSelectOption value="280" class="all-option">280</IonSelectOption>
                                                                                                            <IonSelectOption value="295" class="all-option">295</IonSelectOption>
                                                                                                            <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                                                                            <IonSelectOption value="305" class="all-option">305</IonSelectOption>
                                                                                                            <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                                            <IonSelectOption value="317" class="all-option">317</IonSelectOption>
                                                                                                            <IonSelectOption value="354" class="all-option">354</IonSelectOption>
                                                                                                            <IonSelectOption value="360" class="all-option">360</IonSelectOption>
                                                                                                            <IonSelectOption value="373" class="all-option">373</IonSelectOption>
                                                                                                            <IonSelectOption value="381S" class="all-option">381S</IonSelectOption>
                                                                                                            <IonSelectOption value="412" class="all-option">413</IonSelectOption>
                                                                                                            <IonSelectOption value="485" class="all-option">485</IonSelectOption>
                                                                                                          </>
                                                                                                          : postClassName === 'PSYC' ?
                                                                                                            <>
                                                                                                              <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                                                                                              <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                              <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                                              <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                                                                                              <IonSelectOption value="240" class="all-option">240</IonSelectOption>
                                                                                                              <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                                                              <IonSelectOption value="302" class="all-option">302</IonSelectOption>
                                                                                                              <IonSelectOption value="303" class="all-option">303</IonSelectOption>
                                                                                                              <IonSelectOption value="306" class="all-option">306</IonSelectOption>
                                                                                                              <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                                              <IonSelectOption value="321" class="all-option">321</IonSelectOption>
                                                                                                              <IonSelectOption value="322" class="all-option">322</IonSelectOption>
                                                                                                              <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                                                              <IonSelectOption value="324" class="all-option">324</IonSelectOption>
                                                                                                              <IonSelectOption value="335" class="all-option">335</IonSelectOption>
                                                                                                              <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                                                                              <IonSelectOption value="337" class="all-option">337</IonSelectOption>
                                                                                                              <IonSelectOption value="338" class="all-option">338</IonSelectOption>
                                                                                                              <IonSelectOption value="345" class="all-option">345</IonSelectOption>
                                                                                                              <IonSelectOption value="411" class="all-option">411</IonSelectOption>
                                                                                                              <IonSelectOption value="414" class="all-option">414</IonSelectOption>
                                                                                                              <IonSelectOption value="415" class="allƒ-option">415</IonSelectOption>
                                                                                                              <IonSelectOption value="419" class="all-option">419</IonSelectOption>
                                                                                                              <IonSelectOption value="436" class="all-option">436</IonSelectOption>
                                                                                                              <IonSelectOption value="454" class="all-option">454</IonSelectOption>
                                                                                                              <IonSelectOption value="473" class="all-option">473</IonSelectOption>
                                                                                                              <IonSelectOption value="486" class="all-option">486</IonSelectOption>
                                                                                                              <IonSelectOption value="489S" class="all-option">489S</IonSelectOption>
                                                                                                              <IonSelectOption value="490" class="all-option">490</IonSelectOption>
                                                                                                              <IonSelectOption value="495" class="all-option">495</IonSelectOption>
                                                                                                              <IonSelectOption value="497" class="all-option">497</IonSelectOption>
                                                                                                              <IonSelectOption value="499" class="all-option">499</IonSelectOption>
                                                                                                              <IonSelectOption value="511" class="all-option">511</IonSelectOption>
                                                                                                              <IonSelectOption value="605" class="all-option">605</IonSelectOption>
                                                                                                              <IonSelectOption value="607" class="all-option">607</IonSelectOption>
                                                                                                              <IonSelectOption value="616" class="all-option">616</IonSelectOption>
                                                                                                              <IonSelectOption value="622" class="all-option">622</IonSelectOption>
                                                                                                              <IonSelectOption value="632" class="all-option">632</IonSelectOption>
                                                                                                              <IonSelectOption value="641" class="all-option">641</IonSelectOption>
                                                                                                              <IonSelectOption value="647" class="all-option">647</IonSelectOption>
                                                                                                              <IonSelectOption value="652" class="all-option">652</IonSelectOption>
                                                                                                              <IonSelectOption value="653" class="all-option">653</IonSelectOption>
                                                                                                              <IonSelectOption value="654" class="all-option">654</IonSelectOption>
                                                                                                              <IonSelectOption value="657" class="all-option">657</IonSelectOption>
                                                                                                              <IonSelectOption value="658" class="all-option">658</IonSelectOption>
                                                                                                              <IonSelectOption value="659" class="all-option">659</IonSelectOption>
                                                                                                              <IonSelectOption value="662" class="all-option">662</IonSelectOption>
                                                                                                              <IonSelectOption value="673" class="all-option">673</IonSelectOption>
                                                                                                              <IonSelectOption value="676" class="all-option">676</IonSelectOption>
                                                                                                              <IonSelectOption value="680" class="all-option">680</IonSelectOption>
                                                                                                              <IonSelectOption value="690" class="all-option">690</IonSelectOption>
                                                                                                            </>
                                                                                                            : postClassName === 'RS' ?
                                                                                                              <>
                                                                                                                <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                                                <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                                                                                                <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                                                                                                <IonSelectOption value="332" class="all-option">332</IonSelectOption>
                                                                                                                <IonSelectOption value="393" class="all-option">393</IonSelectOption>
                                                                                                                <IonSelectOption value="394" class="all-option">394</IonSelectOption>
                                                                                                              </>
                                                                                                              : postClassName === 'SPAN' ?
                                                                                                                <>
                                                                                                                  <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                                                  <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                                                  <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                                  <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                                                                                  <IonSelectOption value="207" class="all-option">207</IonSelectOption>
                                                                                                                  <IonSelectOption value="308" class="all-option">308</IonSelectOption>
                                                                                                                  <IonSelectOption value="313" class="all-option">313</IonSelectOption>
                                                                                                                  <IonSelectOption value="343" class="all-option">343</IonSelectOption>
                                                                                                                  <IonSelectOption value="345" class="all-option">345</IonSelectOption>
                                                                                                                  <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                                                </>
                                                                                                                : postClassName === 'STAT' ?
                                                                                                                  <>
                                                                                                                    <IonSelectOption value="108" class="all-option">108</IonSelectOption>
                                                                                                                    <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                                                                                                    <IonSelectOption value="323" class="all-option">323</IonSelectOption>
                                                                                                                    <IonSelectOption value="333" class="all-option">333</IonSelectOption>
                                                                                                                    <IonSelectOption value="410" class="all-option">410</IonSelectOption>
                                                                                                                    <IonSelectOption value="510" class="all-option">510</IonSelectOption>
                                                                                                                  </>
                                                                                                                  : postClassName === 'TA' ?
                                                                                                                    <>
                                                                                                                      <IonSelectOption value="104" class="all-option">104</IonSelectOption>
                                                                                                                      <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                                                                                      <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                                                                                      <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                                                                                      <IonSelectOption value="231" class="all-option">231</IonSelectOption>
                                                                                                                      <IonSelectOption value="237" class="all-option">237</IonSelectOption>
                                                                                                                      <IonSelectOption value="328" class="all-option">328</IonSelectOption>
                                                                                                                      <IonSelectOption value="336" class="all-option">336</IonSelectOption>
                                                                                                                      <IonSelectOption value="340" class="all-option">340</IonSelectOption>
                                                                                                                      <IonSelectOption value="494" class="all-option">494</IonSelectOption>
                                                                                                                    </>
                                                                                                                    : postClassName === 'WLDF' ?
                                                                                                                      <>
                                                                                                                        <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                                                                                                        <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                                                                                        <IonSelectOption value="244" class="all-option">244</IonSelectOption>
                                                                                                                        <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                                                                                                        <IonSelectOption value="311" class="all-option">311</IonSelectOption>
                                                                                                                        <IonSelectOption value="365" class="all-option">365</IonSelectOption>
                                                                                                                        <IonSelectOption value="422" class="all-option">422</IonSelectOption>
                                                                                                                        <IonSelectOption value="423" class="all-option">423</IonSelectOption>
                                                                                                                        <IonSelectOption value="430" class="all-option">430</IonSelectOption>
                                                                                                                        <IonSelectOption value="460" class="all-option">460</IonSelectOption>
                                                                                                                        <IonSelectOption value="468" class="all-option">468</IonSelectOption>
                                                                                                                        <IonSelectOption value="475" class="all-option">475</IonSelectOption>
                                                                                                                        <IonSelectOption value="478" class="all-option">478</IonSelectOption>
                                                                                                                      </>
                                                                                                                      : postClassName === 'ZOOL' ?
                                                                                                                        <>
                                                                                                                          <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                                                                                          <IonSelectOption value="113" class="all-option">113</IonSelectOption>
                                                                                                                          <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                                                                                                          <IonSelectOption value="270" class="all-option">270</IonSelectOption>
                                                                                                                          <IonSelectOption value="310" class="all-option">310</IonSelectOption>
                                                                                                                          <IonSelectOption value="314" class="all-option">314</IonSelectOption>
                                                                                                                          <IonSelectOption value="356" class="all-option">356</IonSelectOption>
                                                                                                                          <IonSelectOption value="358" class="all-option">358</IonSelectOption>
                                                                                                                          <IonSelectOption value="370" class="all-option">370</IonSelectOption>
                                                                                                                        </>
                                                                                                                        : null

                            }
                          </>
                        </IonSelect>
                      </IonItem>
                    }
                  </IonFab>
                }
                {schoolName && schoolName === "UC Berkeley" &&
                  <>
                    <IonFab horizontal="start" style={{
                      textAlign: "center", alignItems: "center",
                      alignSelf: "center", display: "flex", paddingTop: ""
                    }}>
                      <IonItem mode="ios">
                        <IonSelect
                          interface="action-sheet"
                          interfaceOptions={selectOptions}
                          okText="Select"
                          cancelText="Cancel"
                          mode="ios"
                          value={postClassName}
                          placeholder="Class: "
                          onIonChange={(e: any) => {
                            setPostClassNumber("");
                            setPostClassName(e.detail.value);
                          }}
                        >
                          <IonSelectOption value="AERO ENG" class="all-option">AERO ENG</IonSelectOption>
                          <IonSelectOption value="AEROSPC" class="all-option">AEROSPC</IonSelectOption>
                          <IonSelectOption value="AFRICAM" class="all-option">AFRICAM</IonSelectOption>
                          <IonSelectOption value="A,RESEC" class="all-option">A,RESEC</IonSelectOption>
                          <IonSelectOption value="AMERSTD" class="all-option">AMERSTD</IonSelectOption>
                          <IonSelectOption value="AGRS" class="all-option">AGRS</IonSelectOption>
                          <IonSelectOption value="AHMA" class="all-option">AHMA</IonSelectOption>
                          <IonSelectOption value="ANTHRO" class="all-option">ANTHRO</IonSelectOption>
                          <IonSelectOption value="AST" class="all-option">AST</IonSelectOption>
                          <IonSelectOption value="ARABIC" class="all-option">ARABIC</IonSelectOption>
                          <IonSelectOption value="ARCH" class="all-option">ARCH</IonSelectOption>
                          <IonSelectOption value="ARMENI" class="all-option">ARMENI</IonSelectOption>
                          <IonSelectOption value="HISTART" class="all-option">HISTART</IonSelectOption>
                          <IonSelectOption value="ART" class="all-option">ART</IonSelectOption>
                          <IonSelectOption value="HUM" class="all-option">HUM</IonSelectOption>
                          <IonSelectOption value="ASAMST" class="all-option">ASAMST</IonSelectOption>
                          <IonSelectOption value="ASIANST" class="all-option">ASIANST</IonSelectOption>
                          <IonSelectOption value="ASTRON" class="all-option">ASTRON</IonSelectOption>
                          <IonSelectOption value="BANGLA" class="all-option">BANGLA</IonSelectOption>
                          <IonSelectOption value="BIO ENG" class="all-option">BIO ENG</IonSelectOption>
                          <IonSelectOption value="BIOLOGY" class="all-option">BIOLOGY</IonSelectOption>
                          <IonSelectOption value="BIOPHY" class="all-option">BIOPHY</IonSelectOption>
                          <IonSelectOption value="BOSCRSR" class="all-option">BOSCRSR</IonSelectOption>
                          <IonSelectOption value="BUDDSTD" class="all-option">BUDDSTD</IonSelectOption>
                          <IonSelectOption value="BULGARI" class="all-option">BULGARI</IonSelectOption>
                          <IonSelectOption value="BURMESE" class="all-option">BURMESE</IonSelectOption>
                          <IonSelectOption value="EWMBA" class="all-option">EWMBA</IonSelectOption>
                          <IonSelectOption value="XMBA" class="all-option">XMBA</IonSelectOption>
                          <IonSelectOption value="MBA" class="all-option">MBA</IonSelectOption>
                          <IonSelectOption value="PHDBA" class="all-option">PHDBA</IonSelectOption>
                          <IonSelectOption value="UGBA" class="all-option">UGBA</IonSelectOption>
                          <IonSelectOption value="EDSTEM" class="all-option">EDSTEM</IonSelectOption>
                          <IonSelectOption value="CATALAN" class="all-option">CATALAN</IonSelectOption>
                          <IonSelectOption value="CELTIC" class="all-option">CELTIC</IonSelectOption>
                          <IonSelectOption value="CHM ENG" class="all-option">CHM ENG</IonSelectOption>
                          <IonSelectOption value="CHEM" class="all-option">CHEM</IonSelectOption>
                          <IonSelectOption value="CHICANO" class="all-option">CHICANO</IonSelectOption>
                          <IonSelectOption value="CHINESE" class="all-option">CHINESE</IonSelectOption>
                          <IonSelectOption value="CY PLAN" class="all-option">CY PLAN</IonSelectOption>
                          <IonSelectOption value="CIV ENG" class="all-option">CIV ENG</IonSelectOption>
                          <IonSelectOption value="CLASSIC" class="all-option">CLASSIC</IonSelectOption>
                          <IonSelectOption value="COG SCI" class="all-option">COG SCI</IonSelectOption>
                          <IonSelectOption value="COLWRIT" class="all-option">COLWRIT</IonSelectOption>
                          <IonSelectOption value="COMPBIO" class="all-option">COMPBIO</IonSelectOption>
                          <IonSelectOption value="COM LIT" class="all-option">COM LIT</IonSelectOption>
                          <IonSelectOption value="CMPBIO" class="all-option">CMPBIO</IonSelectOption>
                          <IonSelectOption value="COMPSCI" class="all-option">COMPSCI</IonSelectOption>
                          <IonSelectOption value="CRWRIT" class="all-option">CRWRIT</IonSelectOption>
                          <IonSelectOption value="CRIT TH" class="all-option">CRIT TH</IonSelectOption>
                          <IonSelectOption value="CUNEIF" class="all-option">CUNEIF</IonSelectOption>
                          <IonSelectOption value="CZECH" class="all-option">CZECH</IonSelectOption>
                          <IonSelectOption value="DANISH" class="all-option">DANISH</IonSelectOption>
                          <IonSelectOption value="DATASCI" class="all-option">DATASCI</IonSelectOption>
                          <IonSelectOption value="DATA" class="all-option">DATA</IonSelectOption>
                          <IonSelectOption value="DEMOG" class="all-option">DEMOG</IonSelectOption>
                          <IonSelectOption value="DES INV" class="all-option">DES INV</IonSelectOption>
                          <IonSelectOption value="DEV ENG" class="all-option">DEV ENG</IonSelectOption>
                          <IonSelectOption value="DEVP" class="all-option">DEVP</IonSelectOption>
                          <IonSelectOption value="DEV STD" class="all-option">DEV STD</IonSelectOption>
                          <IonSelectOption value="DIGHUM" class="all-option">DIGHUM</IonSelectOption>
                          <IonSelectOption value="DUTCH" class="all-option">DUTCH</IonSelectOption>
                          <IonSelectOption value="EPS" class="all-option">EPS</IonSelectOption>
                          <IonSelectOption value="EA LANG" class="all-option">EA LANG</IonSelectOption>
                          <IonSelectOption value="ECON" class="all-option">ECON</IonSelectOption>
                          <IonSelectOption value="EDUC" class="all-option">EDUC</IonSelectOption>
                          <IonSelectOption value="EGYPT" class="all-option">EGYPT</IonSelectOption>
                          <IonSelectOption value="EECS" class="all-option">EECS</IonSelectOption>
                          <IonSelectOption value="EL ENG" class="all-option">EL ENG</IonSelectOption>
                          <IonSelectOption value="ENE,RES" class="all-option">ENE,RES</IonSelectOption>
                          <IonSelectOption value="ENGIN" class="all-option">ENGIN</IonSelectOption>
                          <IonSelectOption value="ENGLISH" class="all-option">ENGLISH</IonSelectOption>
                          <IonSelectOption value="ENV DES" class="all-option">ENV DES</IonSelectOption>
                          <IonSelectOption value="ENVECON" class="all-option">ENVECON</IonSelectOption>
                          <IonSelectOption value="ESPM" class="all-option">ESPM</IonSelectOption>
                          <IonSelectOption value="ENV SCI" class="all-option">ENV SCI</IonSelectOption>
                          <IonSelectOption value="ETH STD" class="all-option">ETH STD</IonSelectOption>
                          <IonSelectOption value="EUST" class="all-option">EUST</IonSelectOption>
                          <IonSelectOption value="X" class="all-option">X</IonSelectOption>
                          <IonSelectOption value="FILIPN" class="all-option">FILIPN</IonSelectOption>
                          <IonSelectOption value="FILM" class="all-option">FILM</IonSelectOption>
                          <IonSelectOption value="MFE" class="all-option">MFE</IonSelectOption>
                          <IonSelectOption value="FINNISH" class="all-option">FINNISH</IonSelectOption>
                          <IonSelectOption value="FOLKLOR" class="all-option">FOLKLOR</IonSelectOption>
                          <IonSelectOption value="FRENCH" class="all-option">FRENCH</IonSelectOption>
                          <IonSelectOption value="GWS" class="all-option">GWS</IonSelectOption>
                          <IonSelectOption value="GEOG" class="all-option">GEOG</IonSelectOption>
                          <IonSelectOption value="GERMAN" class="all-option">GERMAN</IonSelectOption>
                          <IonSelectOption value="GMS" class="all-option">GMS</IonSelectOption>
                          <IonSelectOption value="GPP" class="all-option">GPP</IonSelectOption>
                          <IonSelectOption value="GLOBAL" class="all-option">GLOBAL</IonSelectOption>
                          <IonSelectOption value="GSPDP" class="all-option">GSPDP</IonSelectOption>
                          <IonSelectOption value="GREEK" class="all-option">GREEK</IonSelectOption>
                          <IonSelectOption value="HMEDSCI" class="all-option">HMEDSCI</IonSelectOption>
                          <IonSelectOption value="HEBREW" class="all-option">HEBREW</IonSelectOption>
                          <IonSelectOption value="HINDI" class="all-option">HINDI</IonSelectOption>
                          <IonSelectOption value="HISTORY" class="all-option">HISTORY</IonSelectOption>
                          <IonSelectOption value="HUNGARI" class="all-option">HUNGARI</IonSelectOption>
                          <IonSelectOption value="ICELAND" class="all-option">ICELAND</IonSelectOption>
                          <IonSelectOption value="INDONES" class="all-option">INDONES</IonSelectOption>
                          <IonSelectOption value="IND ENG" class="all-option">IND ENG</IonSelectOption>
                          <IonSelectOption value="CYBER" class="all-option">CYBER</IonSelectOption>
                          <IonSelectOption value="INFO" class="all-option">INFO</IonSelectOption>
                          <IonSelectOption value="INTEGBI" class="all-option">INTEGBI</IonSelectOption>
                          <IonSelectOption value="ISF" class="all-option">ISF</IonSelectOption>
                          <IonSelectOption value="IAS" class="all-option">IAS</IonSelectOption>
                          <IonSelectOption value="IRANIAN" class="all-option">IRANIAN</IonSelectOption>
                          <IonSelectOption value="ITALIAN" class="all-option">ITALIAN</IonSelectOption>
                          <IonSelectOption value="JAPAN" class="all-option">JAPAN</IonSelectOption>
                          <IonSelectOption value="JEWISH" class="all-option">JEWISH</IonSelectOption>
                          <IonSelectOption value="JOURN" class="all-option">JOURN</IonSelectOption>
                          <IonSelectOption value="KHMER" class="all-option">KHMER</IonSelectOption>
                          <IonSelectOption value="KOREAN" class="all-option">KOREAN</IonSelectOption>
                          <IonSelectOption value="LD ARCH" class="all-option">LD ARCH</IonSelectOption>
                          <IonSelectOption value="LAN PRO" class="all-option">LAN PRO</IonSelectOption>
                          <IonSelectOption value="LATAMST" class="all-option">LATAMST</IonSelectOption>
                          <IonSelectOption value="LATIN" class="all-option">LATIN</IonSelectOption>
                          <IonSelectOption value="LAW" class="all-option">LAW</IonSelectOption>
                          <IonSelectOption value="LEGALST" class="all-option">LEGALST</IonSelectOption>
                          <IonSelectOption value="LGBT" class="all-option">LGBT</IonSelectOption>
                          <IonSelectOption value="L&S" class="all-option">L&S</IonSelectOption>
                          <IonSelectOption value="LINGUIS" class="all-option">LINGUIS</IonSelectOption>
                          <IonSelectOption value="MAT SCI" class="all-option">MAT SCI</IonSelectOption>
                          <IonSelectOption value="MPS" class="all-option">MPS</IonSelectOption>
                          <IonSelectOption value="MATH" class="all-option">MATH</IonSelectOption>
                          <IonSelectOption value="MEC ENG" class="all-option">MEC ENG</IonSelectOption>
                          <IonSelectOption value="MEDIAST" class="all-option">MEDIAST</IonSelectOption>
                          <IonSelectOption value="MED ST" class="all-option">MED ST</IonSelectOption>
                          <IonSelectOption value="MELC" class="all-option">MELC</IonSelectOption>
                          <IonSelectOption value="M E STU" class="all-option">M E STU</IonSelectOption>
                          <IonSelectOption value="MIL AFF" class="all-option">MIL AFF</IonSelectOption>
                          <IonSelectOption value="MIL SCI" class="all-option">MIL SCI</IonSelectOption>
                          <IonSelectOption value="MCELLBI" class="all-option">MCELLBI</IonSelectOption>
                          <IonSelectOption value="MONGOLN" class="all-option">MONGOLN</IonSelectOption>
                          <IonSelectOption value="MUSIC" class="all-option">MUSIC</IonSelectOption>
                          <IonSelectOption value="NSE" class="all-option">NSE</IonSelectOption>
                          <IonSelectOption value="NATAMST" class="all-option">NATAMST</IonSelectOption>
                          <IonSelectOption value="NAT RES" class="all-option">NAT RES</IonSelectOption>
                          <IonSelectOption value="NAV SCI" class="all-option">NAV SCI</IonSelectOption>
                          <IonSelectOption value="NEUROSC" class="all-option">NEUROSC</IonSelectOption>
                          <IonSelectOption value="NWMEDIA" class="all-option">NWMEDIA</IonSelectOption>
                          <IonSelectOption value="NORWEGN" class="all-option">NORWEGN</IonSelectOption>
                          <IonSelectOption value="NUC ENG" class="all-option">NUC ENG</IonSelectOption>
                          <IonSelectOption value="NUSCTX" class="all-option">NUSCTX</IonSelectOption>
                          <IonSelectOption value="OPTOM" class="all-option">OPTOM</IonSelectOption>
                          <IonSelectOption value="PACS" class="all-option">PACS</IonSelectOption>
                          <IonSelectOption value="PERSIAN" class="all-option">PERSIAN</IonSelectOption>
                          <IonSelectOption value="PHILOS" class="all-option">PHILOS</IonSelectOption>
                          <IonSelectOption value="PHYS ED" class="all-option">PHYS ED</IonSelectOption>
                          <IonSelectOption value="PHYSICS" class="all-option">PHYSICS</IonSelectOption>
                          <IonSelectOption value="PLANTBI" class="all-option">PLANTBI</IonSelectOption>
                          <IonSelectOption value="POLISH" class="all-option">POLISH</IonSelectOption>
                          <IonSelectOption value="POLECON" class="all-option">POLECON</IonSelectOption>
                          <IonSelectOption value="POL SCI" class="all-option">POL SCI</IonSelectOption>
                          <IonSelectOption value="PORTUG" class="all-option">PORTUG</IonSelectOption>
                          <IonSelectOption value="PSYCH" class="all-option">PSYCH</IonSelectOption>
                          <IonSelectOption value="PUB AFF" class="all-option">PUB AFF</IonSelectOption>
                          <IonSelectOption value="PB HLTH" class="all-option">PB HLTH</IonSelectOption>
                          <IonSelectOption value="PUB POL" class="all-option">PUB POL</IonSelectOption>
                          <IonSelectOption value="PUNJABI" class="all-option">PUNJABI</IonSelectOption>
                          <IonSelectOption value="RDEV" class="all-option">RDEV</IonSelectOption>
                          <IonSelectOption value="RHETOR" class="all-option">RHETOR</IonSelectOption>
                          <IonSelectOption value="RUSSIAN" class="all-option">RUSSIAN</IonSelectOption>
                          <IonSelectOption value="SANSKR" class="all-option">SANSKR</IonSelectOption>
                          <IonSelectOption value="SCANDIN" class="all-option">SCANDIN</IonSelectOption>
                          <IonSelectOption value="SCMATHE" class="all-option">SCMATHE</IonSelectOption>
                          <IonSelectOption value="STS" class="all-option">STS</IonSelectOption>
                          <IonSelectOption value="SEMITIC" class="all-option">SEMITIC</IonSelectOption>
                          <IonSelectOption value="SLAVIC" class="all-option">SLAVIC</IonSelectOption>
                          <IonSelectOption value="SOC WEL" class="all-option">SOC WEL</IonSelectOption>
                          <IonSelectOption value="SOCIOL" class="all-option">SOCIOL</IonSelectOption>
                          <IonSelectOption value="SSEASN" class="all-option">SSEASN</IonSelectOption>
                          <IonSelectOption value="SASIAN" class="all-option">SASIAN</IonSelectOption>
                          <IonSelectOption value="SEASIAN" class="all-option">SEASIAN</IonSelectOption>
                          <IonSelectOption value="SPANISH" class="all-option">SPANISH</IonSelectOption>
                          <IonSelectOption value="STAT" class="all-option">STAT</IonSelectOption>
                          <IonSelectOption value="STRELIG" class="all-option">STRELIG</IonSelectOption>
                          <IonSelectOption value="SWEDISH" class="all-option">SWEDISH</IonSelectOption>
                          <IonSelectOption value="TAMIL" class="all-option">TAMIL</IonSelectOption>
                          <IonSelectOption value="TELUGU" class="all-option">TELUGU</IonSelectOption>
                          <IonSelectOption value="THAI" class="all-option">THAI</IonSelectOption>
                          <IonSelectOption value="THEATER" class="all-option">THEATER</IonSelectOption>
                          <IonSelectOption value="TIBETAN" class="all-option">TIBETAN</IonSelectOption>
                          <IonSelectOption value="TURKISH" class="all-option">TURKISH</IonSelectOption>
                          <IonSelectOption value="UKRAINI" class="all-option">UKRAINI</IonSelectOption>
                          <IonSelectOption value="UGIS" class="all-option">UGIS</IonSelectOption>
                          <IonSelectOption value="URDU" class="all-option">URDU</IonSelectOption>
                          <IonSelectOption value="VIETNMS" class="all-option">VIETNMS</IonSelectOption>
                          <IonSelectOption value="VIS SCI" class="all-option">VIS SCI</IonSelectOption>
                          <IonSelectOption value="VIS STD" class="all-option">VIS STD</IonSelectOption>
                          <IonSelectOption value="YIDDISH" class="all-option">YIDDISH</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      {postClassName && postClassName.length > 0 && false &&
                        <IonItem>
                          <IonSelect
                            interface="action-sheet"
                            interfaceOptions={selectOptionsNumber}
                            okText="Select"
                            cancelText="Cancel"
                            mode="ios"
                            value={postClassNumber}
                            placeholder="#:"
                            onIonChange={(e: any) => {
                              setPostClassNumber(e.detail.value);
                            }}
                          >
                            <>
                              {postClassName === 'AERO ENG' ?
                                <>
                                  <IonSelectOption value="1" class="all-option">1</IonSelectOption>
                                  <IonSelectOption value="2" class="all-option">2</IonSelectOption>
                                  <IonSelectOption value="10" class="all-option">10</IonSelectOption>
                                  <IonSelectOption value="24" class="all-option">24</IonSelectOption>
                                  <IonSelectOption value="98" class="all-option">98</IonSelectOption>
                                  <IonSelectOption value="C184" class="all-option">C184</IonSelectOption>
                                  <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                </>
                                : postClassName === 'AEROSPC' ?
                                  <>
                                    <IonSelectOption value="1A" class="all-option">1A</IonSelectOption>
                                    <IonSelectOption value="1B" class="all-option">1B</IonSelectOption>
                                    <IonSelectOption value="2A" class="all-option">2A</IonSelectOption>
                                    <IonSelectOption value="2B" class="all-option">2B</IonSelectOption>
                                    <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                    <IonSelectOption value="135A" class="all-option">135A</IonSelectOption>
                                    <IonSelectOption value="135B" class="all-option">135B</IonSelectOption>
                                  </>
                                  : postClassName === 'AFRICAM' ?
                                    <>
                                      <IonSelectOption value="R1A" class="all-option">R1A</IonSelectOption>
                                      <IonSelectOption value="R1AN" class="all-option">R1AN</IonSelectOption>
                                      <IonSelectOption value="R1B" class="all-option">R1B</IonSelectOption>
                                      <IonSelectOption value="4A" class="all-option">4A</IonSelectOption>
                                      <IonSelectOption value="4B" class="all-option">4B</IonSelectOption>
                                      <IonSelectOption value="N4A" class="all-option">N4A</IonSelectOption>
                                      <IonSelectOption value="5A" class="all-option">5A</IonSelectOption>
                                      <IonSelectOption value="5B" class="all-option">5B</IonSelectOption>
                                      <IonSelectOption value="7A" class="all-option">7A</IonSelectOption>
                                      <IonSelectOption value="7B" class="all-option">7B</IonSelectOption>
                                      <IonSelectOption value="8A" class="all-option">8A</IonSelectOption>
                                      <IonSelectOption value="8B" class="all-option">8B</IonSelectOption>
                                      <IonSelectOption value="9A" class="all-option">9A</IonSelectOption>
                                      <IonSelectOption value="9B" class="all-option">9B</IonSelectOption>
                                      <IonSelectOption value="10A" class="all-option">10A</IonSelectOption>
                                      <IonSelectOption value="10B" class="all-option">10B</IonSelectOption>
                                      <IonSelectOption value="11A" class="all-option">11A</IonSelectOption>
                                      <IonSelectOption value="11B" class="all-option">11B</IonSelectOption>
                                      <IonSelectOption value="12" class="all-option">12</IonSelectOption>
                                      <IonSelectOption value="13A" class="all-option">13A</IonSelectOption>
                                      <IonSelectOption value="13B" class="all-option">13B</IonSelectOption>
                                      <IonSelectOption value="14A" class="all-option">14A</IonSelectOption>
                                      <IonSelectOption value="14B" class="all-option">14B</IonSelectOption>
                                      <IonSelectOption value="15A" class="all-option">15A</IonSelectOption>
                                      <IonSelectOption value="15B" class="all-option">15B</IonSelectOption>
                                      <IonSelectOption value="16A" class="all-option">16A</IonSelectOption>
                                      <IonSelectOption value="16B" class="all-option">16B</IonSelectOption>
                                      <IonSelectOption value="18A" class="all-option">18A</IonSelectOption>
                                      <IonSelectOption value="18B" class="all-option">18B</IonSelectOption>
                                      <IonSelectOption value="19A" class="all-option">19A</IonSelectOption>
                                      <IonSelectOption value="19B" class="all-option">19B</IonSelectOption>
                                      <IonSelectOption value="C20AC" class="all-option">C20AC</IonSelectOption>
                                      <IonSelectOption value="21A" class="all-option">21A</IonSelectOption>
                                      <IonSelectOption value="21B" class="all-option">21B</IonSelectOption>
                                      <IonSelectOption value="24" class="all-option">24</IonSelectOption>
                                      <IonSelectOption value="27AC" class="all-option">27AC</IonSelectOption>
                                      <IonSelectOption value="28AC" class="all-option">28AC</IonSelectOption>
                                      <IonSelectOption value="30A" class="all-option">30A</IonSelectOption>
                                      <IonSelectOption value="30B" class="all-option">30B</IonSelectOption>
                                      <IonSelectOption value="31A" class="all-option">31A</IonSelectOption>
                                      <IonSelectOption value="31B" class="all-option">31B</IonSelectOption>
                                      <IonSelectOption value="39B" class="all-option">39B</IonSelectOption>
                                      <IonSelectOption value="39D" class="all-option">39D</IonSelectOption>
                                      <IonSelectOption value="39E" class="all-option">39E</IonSelectOption>
                                      <IonSelectOption value="39F" class="all-option">39F</IonSelectOption>
                                      <IonSelectOption value="39G" class="all-option">39G</IonSelectOption>
                                      <IonSelectOption value="39H" class="all-option">39H</IonSelectOption>
                                      <IonSelectOption value="40" class="all-option">40</IonSelectOption>
                                      <IonSelectOption value="84" class="all-option">84</IonSelectOption>
                                      <IonSelectOption value="98" class="all-option">98</IonSelectOption>
                                      <IonSelectOption value="98BC" class="all-option">98BC</IonSelectOption>
                                      <IonSelectOption value="99" class="all-option">99</IonSelectOption>
                                      <IonSelectOption value="100" class="all-option">100</IonSelectOption>
                                      <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                      <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                      <IonSelectOption value="109" class="all-option">109</IonSelectOption>
                                      <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                      <IonSelectOption value="W111" class="all-option">W111</IonSelectOption>
                                      <IonSelectOption value="112A" class="all-option">112A</IonSelectOption>
                                      <IonSelectOption value="112B" class="all-option">112B</IonSelectOption>
                                      <IonSelectOption value="114" class="all-option">114</IonSelectOption>
                                      <IonSelectOption value="115" class="all-option">115</IonSelectOption>
                                      <IonSelectOption value="116" class="all-option">116</IonSelectOption>
                                      <IonSelectOption value="117" class="all-option">117</IonSelectOption>
                                      <IonSelectOption value="118" class="all-option">118</IonSelectOption>
                                      <IonSelectOption value="119" class="all-option">119</IonSelectOption>
                                      <IonSelectOption value="120" class="all-option">120</IonSelectOption>
                                      <IonSelectOption value="121" class="all-option">121</IonSelectOption>
                                      <IonSelectOption value="122" class="all-option">122</IonSelectOption>
                                      <IonSelectOption value="123" class="all-option">123</IonSelectOption>
                                      <IonSelectOption value="W124" class="all-option">W124</IonSelectOption>
                                      <IonSelectOption value="125" class="all-option">125</IonSelectOption>
                                      <IonSelectOption value="125AC" class="all-option">125AC</IonSelectOption>
                                      <IonSelectOption value="126" class="all-option">126</IonSelectOption>
                                      <IonSelectOption value="131" class="all-option">131</IonSelectOption>
                                      <IonSelectOption value="N131" class="all-option">N131</IonSelectOption>
                                      <IonSelectOption value="C133A" class="all-option">C133A</IonSelectOption>
                                      <IonSelectOption value="134" class="all-option">134</IonSelectOption>
                                      <IonSelectOption value="C134" class="all-option">C134</IonSelectOption>
                                      <IonSelectOption value="136" class="all-option">136</IonSelectOption>
                                      <IonSelectOption value="136L" class="all-option">136L</IonSelectOption>
                                      <IonSelectOption value="137" class="all-option">137</IonSelectOption>
                                      <IonSelectOption value="138" class="all-option">138</IonSelectOption>
                                      <IonSelectOption value="139" class="all-option">139</IonSelectOption>
                                      <IonSelectOption value="139L" class="all-option">139L</IonSelectOption>
                                      <IonSelectOption value="140" class="all-option">140</IonSelectOption>
                                      <IonSelectOption value="141" class="all-option">141</IonSelectOption>
                                      <IonSelectOption value="142A" class="all-option">142A</IonSelectOption>
                                      <IonSelectOption value="142AC" class="all-option">142AC</IonSelectOption>
                                      <IonSelectOption value="C143A" class="all-option">C143A</IonSelectOption>
                                      <IonSelectOption value="C143B" class="all-option">C143B</IonSelectOption>
                                      <IonSelectOption value="C143C" class="all-option">C143C</IonSelectOption>
                                      <IonSelectOption value="144" class="all-option">144</IonSelectOption>
                                      <IonSelectOption value="150B" class="all-option">150B</IonSelectOption>
                                      <IonSelectOption value="N150B" class="all-option">N150B</IonSelectOption>
                                      <IonSelectOption value="152F" class="all-option">152F</IonSelectOption>
                                      <IonSelectOption value="153C" class="all-option">153C</IonSelectOption>
                                      <IonSelectOption value="155" class="all-option">155</IonSelectOption>
                                      <IonSelectOption value="156AC" class="all-option">156AC</IonSelectOption>
                                      <IonSelectOption value="C156" class="all-option">C156</IonSelectOption>
                                      <IonSelectOption value="158A" class="all-option">158A</IonSelectOption>
                                      <IonSelectOption value="158B" class="all-option">158B</IonSelectOption>
                                      <IonSelectOption value="159" class="all-option">159</IonSelectOption>
                                      <IonSelectOption value="164" class="all-option">164</IonSelectOption>
                                      <IonSelectOption value="165" class="all-option">165</IonSelectOption>
                                      <IonSelectOption value="173AC" class="all-option">173AC</IonSelectOption>
                                      <IonSelectOption value="181AC" class="all-option">181AC</IonSelectOption>
                                      <IonSelectOption value="182AC" class="all-option">182AC</IonSelectOption>
                                      <IonSelectOption value="190AC" class="all-option">190AC</IonSelectOption>
                                      <IonSelectOption value="194A" class="all-option">194A</IonSelectOption>
                                      <IonSelectOption value="194B" class="all-option">194B</IonSelectOption>
                                      <IonSelectOption value="195" class="all-option">195</IonSelectOption>
                                      <IonSelectOption value="H195" class="all-option">H195</IonSelectOption>
                                      <IonSelectOption value="H195A" class="all-option">H195A</IonSelectOption>
                                      <IonSelectOption value="H195B" class="all-option">H195B</IonSelectOption>
                                      <IonSelectOption value="197" class="all-option">197</IonSelectOption>
                                      <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                      <IonSelectOption value="198BC" class="all-option">198BC</IonSelectOption>
                                      <IonSelectOption value="199" class="all-option">199</IonSelectOption>
                                      <IonSelectOption value="201A" class="all-option">201A</IonSelectOption>
                                      <IonSelectOption value="201B" class="all-option">201B</IonSelectOption>
                                      <IonSelectOption value="201D" class="all-option">201D</IonSelectOption>
                                      <IonSelectOption value="240" class="all-option">240</IonSelectOption>
                                      <IonSelectOption value="241" class="all-option">241</IonSelectOption>
                                      <IonSelectOption value="242" class="all-option">242</IonSelectOption>
                                      <IonSelectOption value="250" class="all-option">250</IonSelectOption>
                                      <IonSelectOption value="252" class="all-option">252</IonSelectOption>
                                      <IonSelectOption value="256B" class="all-option">256B</IonSelectOption>
                                      <IonSelectOption value="257A" class="all-option">257A</IonSelectOption>
                                      <IonSelectOption value="257B" class="all-option">257B</IonSelectOption>
                                      <IonSelectOption value="262" class="all-option">262</IonSelectOption>
                                      <IonSelectOption value="C265" class="all-option">C265</IonSelectOption>
                                      <IonSelectOption value="C286" class="all-option">C286</IonSelectOption>
                                      <IonSelectOption value="296" class="all-option">296</IonSelectOption>
                                      <IonSelectOption value="298" class="all-option">298</IonSelectOption>
                                      <IonSelectOption value="299" class="all-option">299</IonSelectOption>
                                      <IonSelectOption value="C375" class="all-option">C375</IonSelectOption>
                                      <IonSelectOption value="601" class="all-option">601</IonSelectOption>
                                      <IonSelectOption value="602" class="all-option">602</IonSelectOption>
                                    </>
                                    : postClassName === 'A,RESEC' ?
                                      <>
                                        <IonSelectOption value="201" class="all-option">201</IonSelectOption>
                                        <IonSelectOption value="202" class="all-option">202</IonSelectOption>
                                        <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                        <IonSelectOption value="211" class="all-option">211</IonSelectOption>
                                        <IonSelectOption value="212" class="all-option">212</IonSelectOption>
                                        <IonSelectOption value="213" class="all-option">213</IonSelectOption>
                                        <IonSelectOption value="214" class="all-option">214</IonSelectOption>
                                        <IonSelectOption value="219A" class="all-option">219A</IonSelectOption>
                                        <IonSelectOption value="219B" class="all-option">219B</IonSelectOption>
                                        <IonSelectOption value="232" class="all-option">232</IonSelectOption>
                                        <IonSelectOption value="241" class="all-option">241</IonSelectOption>
                                        <IonSelectOption value="242" class="all-option">242</IonSelectOption>
                                        <IonSelectOption value="249" class="all-option">249</IonSelectOption>
                                        <IonSelectOption value="C251" class="all-option">C251</IonSelectOption>
                                        <IonSelectOption value="C253" class="all-option">C253</IonSelectOption>
                                        <IonSelectOption value="259" class="all-option">259</IonSelectOption>
                                        <IonSelectOption value="261" class="all-option">261</IonSelectOption>
                                        <IonSelectOption value="262" class="all-option">262</IonSelectOption>
                                        <IonSelectOption value="263" class="all-option">263</IonSelectOption>
                                        <IonSelectOption value="264" class="all-option">264</IonSelectOption>
                                        <IonSelectOption value="265" class="all-option">265</IonSelectOption>
                                        <IonSelectOption value="269" class="all-option">269</IonSelectOption>
                                        <IonSelectOption value="298" class="all-option">298</IonSelectOption>
                                        <IonSelectOption value="299" class="all-option">299</IonSelectOption>
                                        <IonSelectOption value="375" class="all-option">375</IonSelectOption>
                                        <IonSelectOption value="400" class="all-option">400</IonSelectOption>
                                        <IonSelectOption value="602" class="all-option">602</IonSelectOption>
                                      </>
                                      : postClassName === 'AMERSTD' ?
                                        <>
                                          <IonSelectOption value="5" class="all-option">5</IonSelectOption>
                                          <IonSelectOption value="10" class="all-option">10</IonSelectOption>
                                          <IonSelectOption value="10AC" class="all-option">10AC</IonSelectOption>
                                          <IonSelectOption value="C10" class="all-option">C10</IonSelectOption>
                                          <IonSelectOption value="24" class="all-option">24</IonSelectOption>
                                          <IonSelectOption value="98" class="all-option">98</IonSelectOption>
                                          <IonSelectOption value="99" class="all-option">99</IonSelectOption>
                                          <IonSelectOption value="101" class="all-option">101</IonSelectOption>
                                          <IonSelectOption value="101AC" class="all-option">101AC</IonSelectOption>
                                          <IonSelectOption value="102" class="all-option">102</IonSelectOption>
                                          <IonSelectOption value="102AC" class="all-option">102AC</IonSelectOption>
                                          <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                          <IonSelectOption value="110AC" class="all-option">110AC</IonSelectOption>
                                          <IonSelectOption value="H110" class="all-option">H110</IonSelectOption>
                                          <IonSelectOption value="C111A" class="all-option">C111A</IonSelectOption>
                                          <IonSelectOption value="C111E" class="all-option">C111E</IonSelectOption>
                                          <IonSelectOption value="C112" class="all-option">C112</IonSelectOption>
                                          <IonSelectOption value="C112A" class="all-option">C112A</IonSelectOption>
                                          <IonSelectOption value="C112B" class="all-option">C112B</IonSelectOption>
                                          <IonSelectOption value="C112F" class="all-option">C112F</IonSelectOption>
                                          <IonSelectOption value="C115" class="all-option">C115</IonSelectOption>
                                          <IonSelectOption value="121" class="all-option">121</IonSelectOption>
                                          <IonSelectOption value="C132B" class="all-option">C132B</IonSelectOption>
                                          <IonSelectOption value="132Y" class="all-option">132Y</IonSelectOption>
                                          <IonSelectOption value="C134" class="all-option">C134</IonSelectOption>
                                          <IonSelectOption value="138AC" class="all-option">138AC</IonSelectOption>
                                          <IonSelectOption value="139AC" class="all-option">139AC</IonSelectOption>
                                          <IonSelectOption value="142Y" class="all-option">142Y</IonSelectOption>
                                          <IonSelectOption value="C152" class="all-option">C152</IonSelectOption>
                                          <IonSelectOption value="170AC" class="all-option">170AC</IonSelectOption>
                                          <IonSelectOption value="C171" class="all-option">C171</IonSelectOption>
                                          <IonSelectOption value="C172" class="all-option">C172</IonSelectOption>
                                          <IonSelectOption value="C174" class="all-option">C174</IonSelectOption>
                                          <IonSelectOption value="178AC" class="all-option">178AC</IonSelectOption>
                                          <IonSelectOption value="179AC" class="all-option">179AC</IonSelectOption>
                                          <IonSelectOption value="189" class="all-option">189</IonSelectOption>
                                          <IonSelectOption value="190" class="all-option">190</IonSelectOption>
                                          <IonSelectOption value="191" class="all-option">191</IonSelectOption>
                                          <IonSelectOption value="H195" class="all-option">H195</IonSelectOption>
                                          <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                          <IonSelectOption value="199" class="all-option">199</IonSelectOption>
                                          <IonSelectOption value="300" class="all-option">300</IonSelectOption>
                                        </>
                                        : postClassName === 'AGRS' ?
                                          <>
                                            <IonSelectOption value="10A" class="all-option">10A</IonSelectOption>
                                            <IonSelectOption value="10B" class="all-option">10B</IonSelectOption>
                                            <IonSelectOption value="17A" class="all-option">17A</IonSelectOption>
                                            <IonSelectOption value="17B" class="all-option">17B</IonSelectOption>
                                            <IonSelectOption value="24" class="all-option">24</IonSelectOption>
                                            <IonSelectOption value="28" class="all-option">28</IonSelectOption>
                                            <IonSelectOption value="N28" class="all-option">N28</IonSelectOption>
                                            <IonSelectOption value="29" class="all-option">29</IonSelectOption>
                                            <IonSelectOption value="34" class="all-option">34</IonSelectOption>
                                            <IonSelectOption value="35" class="all-option">35</IonSelectOption>
                                            <IonSelectOption value="36" class="all-option">36</IonSelectOption>
                                            <IonSelectOption value="39A" class="all-option">39A</IonSelectOption>
                                            <IonSelectOption value="39B" class="all-option">39B</IonSelectOption>
                                            <IonSelectOption value="39C" class="all-option">39C</IonSelectOption>
                                            <IonSelectOption value="39D" class="all-option">39D</IonSelectOption>
                                            <IonSelectOption value="39K" class="all-option">39K</IonSelectOption>
                                            <IonSelectOption value="R44" class="all-option">R44</IonSelectOption>
                                            <IonSelectOption value="50" class="all-option">50</IonSelectOption>
                                            <IonSelectOption value="98" class="all-option">98</IonSelectOption>
                                            <IonSelectOption value="99" class="all-option">99</IonSelectOption>
                                            <IonSelectOption value="121" class="all-option">121</IonSelectOption>
                                            <IonSelectOption value="124" class="all-option">124</IonSelectOption>
                                            <IonSelectOption value="130" class="all-option">130</IonSelectOption>
                                            <IonSelectOption value="130A" class="all-option">130A</IonSelectOption>
                                            <IonSelectOption value="130B" class="all-option">130B</IonSelectOption>
                                            <IonSelectOption value="130C" class="all-option">130C</IonSelectOption>
                                            <IonSelectOption value="130D" class="all-option">130D</IonSelectOption>
                                            <IonSelectOption value="130E" class="all-option">130E</IonSelectOption>
                                            <IonSelectOption value="130F" class="all-option">130F</IonSelectOption>
                                            <IonSelectOption value="130G" class="all-option">130G</IonSelectOption>
                                            <IonSelectOption value="130H" class="all-option">130H</IonSelectOption>
                                            <IonSelectOption value="130I" class="all-option">130I</IonSelectOption>
                                            <IonSelectOption value="130J" class="all-option">130J</IonSelectOption>
                                            <IonSelectOption value="130K" class="all-option">130K</IonSelectOption>
                                            <IonSelectOption value="130L" class="all-option">130L</IonSelectOption>
                                            <IonSelectOption value="130M" class="all-option">130M</IonSelectOption>
                                            <IonSelectOption value="130N" class="all-option">130N</IonSelectOption>
                                            <IonSelectOption value="130P" class="all-option">130P</IonSelectOption>
                                            <IonSelectOption value="130R" class="all-option">130R</IonSelectOption>
                                            <IonSelectOption value="130S" class="all-option">130S</IonSelectOption>
                                            <IonSelectOption value="161" class="all-option">161</IonSelectOption>
                                            <IonSelectOption value="163" class="all-option">163</IonSelectOption>
                                            <IonSelectOption value="170A" class="all-option">170A</IonSelectOption>
                                            <IonSelectOption value="170C" class="all-option">170C</IonSelectOption>
                                            <IonSelectOption value="170D" class="all-option">170D</IonSelectOption>
                                            <IonSelectOption value="172" class="all-option">172</IonSelectOption>
                                            <IonSelectOption value="N172A" class="all-option">N172A</IonSelectOption>
                                            <IonSelectOption value="N172B" class="all-option">N172B</IonSelectOption>
                                            <IonSelectOption value="175A" class="all-option">175A</IonSelectOption>
                                            <IonSelectOption value="175D" class="all-option">175D</IonSelectOption>
                                            <IonSelectOption value="175F" class="all-option">175F</IonSelectOption>
                                            <IonSelectOption value="175G" class="all-option">175G</IonSelectOption>
                                            <IonSelectOption value="C175F" class="all-option">C175F</IonSelectOption>
                                            <IonSelectOption value="180" class="all-option">180</IonSelectOption>
                                            <IonSelectOption value="H195A" class="all-option">H195A</IonSelectOption>
                                            <IonSelectOption value="H195B" class="all-option">H195B</IonSelectOption>
                                            <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                            <IonSelectOption value="199" class="all-option">199</IonSelectOption>
                                          </>
                                          : postClassName === 'AHMA' ?
                                            <>
                                              <IonSelectOption value="R1B" class="all-option">R1B</IonSelectOption>
                                              <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                              <IonSelectOption value="298" class="all-option">298</IonSelectOption>
                                              <IonSelectOption value="299" class="all-option">299</IonSelectOption>
                                              <IonSelectOption value="601" class="all-option">601</IonSelectOption>
                                              <IonSelectOption value="602" class="all-option">602</IonSelectOption>
                                            </>
                                            : postClassName === 'ANTHRO' ?
                                              <>
                                                <IonSelectOption value="1" class="all-option">1</IonSelectOption>
                                                <IonSelectOption value="2" class="all-option">2</IonSelectOption>
                                                <IonSelectOption value="2AC" class="all-option">2AC</IonSelectOption>
                                                <IonSelectOption value="3" class="all-option">3</IonSelectOption>
                                                <IonSelectOption value="3AC" class="all-option">3AC</IonSelectOption>
                                                <IonSelectOption value="R5B" class="all-option">R5B</IonSelectOption>
                                                <IonSelectOption value="C12AC" class="all-option">C12AC</IonSelectOption>
                                                <IonSelectOption value="24" class="all-option">24</IonSelectOption>
                                                <IonSelectOption value="39" class="all-option">39</IonSelectOption>
                                                <IonSelectOption value="84" class="all-option">84</IonSelectOption>
                                                <IonSelectOption value="98" class="all-option">98</IonSelectOption>
                                                <IonSelectOption value="99" class="all-option">99</IonSelectOption>
                                                <IonSelectOption value="105" class="all-option">105</IonSelectOption>
                                                <IonSelectOption value="106" class="all-option">106</IonSelectOption>
                                                <IonSelectOption value="107" class="all-option">107</IonSelectOption>
                                                <IonSelectOption value="110" class="all-option">110</IonSelectOption>
                                                <IonSelectOption value="111" class="all-option">111</IonSelectOption>
                                                <IonSelectOption value="112" class="all-option">112</IonSelectOption>
                                                <IonSelectOption value="113" class="all-option">113</IonSelectOption>
                                                <IonSelectOption value="114" class="all-option">114</IonSelectOption>
                                                <IonSelectOption value="115" class="all-option">115</IonSelectOption>
                                                <IonSelectOption value="119" class="all-option">119</IonSelectOption>
                                                <IonSelectOption value="C119A" class="all-option">C119A</IonSelectOption>
                                                <IonSelectOption value="121A" class="all-option">121A</IonSelectOption>
                                                <IonSelectOption value="121AC" class="all-option">121AC</IonSelectOption>
                                                <IonSelectOption value="121B" class="all-option">121B</IonSelectOption>
                                                <IonSelectOption value="121C" class="all-option">121C</IonSelectOption>
                                                <IonSelectOption value="122A" class="all-option">122A</IonSelectOption>
                                                <IonSelectOption value="122B" class="all-option">122B</IonSelectOption>
                                                <IonSelectOption value="122C" class="all-option">122C</IonSelectOption>
                                                <IonSelectOption value="122D" class="all-option">122D</IonSelectOption>
                                                <IonSelectOption value="122E" class="all-option">122E</IonSelectOption>
                                                <IonSelectOption value="122F" class="all-option">122F</IonSelectOption>
                                                <IonSelectOption value="122G" class="all-option">122G</IonSelectOption>
                                                <IonSelectOption value="122H" class="all-option">122H</IonSelectOption>
                                                <IonSelectOption value="123A" class="all-option">123A</IonSelectOption>
                                                <IonSelectOption value="123B" class="all-option">123B</IonSelectOption>
                                                <IonSelectOption value="123C" class="all-option">123C</IonSelectOption>
                                                <IonSelectOption value="123E" class="all-option">123E</IonSelectOption>
                                                <IonSelectOption value="124A" class="all-option">124A</IonSelectOption>
                                                <IonSelectOption value="124B" class="all-option">124B</IonSelectOption>
                                                <IonSelectOption value="C124C" class="all-option">C124C</IonSelectOption>
                                                <IonSelectOption value="C125A" class="all-option">C125A</IonSelectOption>
                                                <IonSelectOption value="C125B" class="all-option">C125B</IonSelectOption>
                                                <IonSelectOption value="126M" class="all-option">126M</IonSelectOption>
                                                <IonSelectOption value="127A" class="all-option">127A</IonSelectOption>
                                                <IonSelectOption value="127B" class="all-option">127B</IonSelectOption>
                                                <IonSelectOption value="127C" class="all-option">127C</IonSelectOption>
                                                <IonSelectOption value="128" class="all-option">128</IonSelectOption>
                                                <IonSelectOption value="128A" class="all-option">128A</IonSelectOption>
                                                <IonSelectOption value="128M" class="all-option">128M</IonSelectOption>
                                                <IonSelectOption value="129" class="all-option">129</IonSelectOption>
                                                <IonSelectOption value="129A" class="all-option">129A</IonSelectOption>
                                                <IonSelectOption value="129B" class="all-option">129B</IonSelectOption>
                                                <IonSelectOption value="129C" class="all-option">129C</IonSelectOption>
                                                <IonSelectOption value="C129D" class="all-option">C129D</IonSelectOption>
                                                <IonSelectOption value="C129F" class="all-option">C129F</IonSelectOption>
                                                <IonSelectOption value="129D" class="all-option">129D</IonSelectOption>
                                                <IonSelectOption value="129E" class="all-option">129E</IonSelectOption>
                                                <IonSelectOption value="130" class="all-option">130</IonSelectOption>
                                                <IonSelectOption value="132A" class="all-option">132A</IonSelectOption>
                                                <IonSelectOption value="134" class="all-option">134</IonSelectOption>
                                                <IonSelectOption value="134A" class="all-option">134A</IonSelectOption>
                                                <IonSelectOption value="135" class="all-option">135</IonSelectOption>
                                                <IonSelectOption value="135B" class="all-option">135B</IonSelectOption>
                                                <IonSelectOption value="136A" class="all-option">136A</IonSelectOption>
                                                <IonSelectOption value="136B" class="all-option">136B</IonSelectOption>
                                                <IonSelectOption value="136D" class="all-option">136D</IonSelectOption>
                                                <IonSelectOption value="136F" class="all-option">136F</IonSelectOption>
                                                <IonSelectOption value="136G" class="all-option">136G</IonSelectOption>
                                                <IonSelectOption value="137" class="all-option">137</IonSelectOption>
                                                <IonSelectOption value="138A" class="all-option">138A</IonSelectOption>
                                                <IonSelectOption value="138B" class="all-option">138B</IonSelectOption>
                                                <IonSelectOption value="140" class="all-option">140</IonSelectOption>
                                                <IonSelectOption value="141" class="all-option">141</IonSelectOption>
                                                <IonSelectOption value="146" class="all-option">146</IonSelectOption>
                                                <IonSelectOption value="147A" class="all-option">147A</IonSelectOption>
                                                <IonSelectOption value="147C" class="all-option">147C</IonSelectOption>
                                                <IonSelectOption value="C147B" class="all-option">C147B</IonSelectOption>
                                                <IonSelectOption value="148" class="all-option">148</IonSelectOption>
                                                <IonSelectOption value="149" class="all-option">149</IonSelectOption>
                                                <IonSelectOption value="150" class="all-option">150</IonSelectOption>
                                                <IonSelectOption value="151" class="all-option">151</IonSelectOption>
                                                <IonSelectOption value="155" class="all-option">155</IonSelectOption>
                                                <IonSelectOption value="156" class="all-option">156</IonSelectOption>
                                                <IonSelectOption value="156A" class="all-option">156A</IonSelectOption>
                                                <IonSelectOption value="156B" class="all-option">156B</IonSelectOption>
                                                <IonSelectOption value="157" class="all-option">157</IonSelectOption>
                                                <IonSelectOption value="158" class="all-option">158</IonSelectOption>
                                                <IonSelectOption value="160AC" class="all-option">160AC</IonSelectOption>
                                                <IonSelectOption value="162" class="all-option">162</IonSelectOption>
                                                <IonSelectOption value="166" class="all-option">166</IonSelectOption>
                                                <IonSelectOption value="169A" class="all-option">169A</IonSelectOption>
                                                <IonSelectOption value="169B" class="all-option">169B</IonSelectOption>
                                                <IonSelectOption value="169C" class="all-option">169C</IonSelectOption>
                                                <IonSelectOption value="170" class="all-option">170</IonSelectOption>
                                                <IonSelectOption value="171" class="all-option">171</IonSelectOption>
                                                <IonSelectOption value="174AC" class="all-option">174AC</IonSelectOption>
                                                <IonSelectOption value="179" class="all-option">179</IonSelectOption>
                                                <IonSelectOption value="180" class="all-option">180</IonSelectOption>
                                                <IonSelectOption value="181" class="all-option">181</IonSelectOption>
                                                <IonSelectOption value="183" class="all-option">183</IonSelectOption>
                                                <IonSelectOption value="184" class="all-option">184</IonSelectOption>
                                                <IonSelectOption value="186" class="all-option">186</IonSelectOption>
                                                <IonSelectOption value="189" class="all-option">189</IonSelectOption>
                                                <IonSelectOption value="189A" class="all-option">189A</IonSelectOption>
                                                <IonSelectOption value="H195A" class="all-option">H195A</IonSelectOption>
                                                <IonSelectOption value="H195B" class="all-option">H195B</IonSelectOption>
                                                <IonSelectOption value="196" class="all-option">196</IonSelectOption>
                                                <IonSelectOption value="197" class="all-option">197</IonSelectOption>
                                                <IonSelectOption value="198" class="all-option">198</IonSelectOption>
                                                <IonSelectOption value="199" class="all-option">199</IonSelectOption>
                                                <IonSelectOption value="210" class="all-option">210</IonSelectOption>
                                                <IonSelectOption value="217" class="all-option">217</IonSelectOption>
                                                <IonSelectOption value="219" class="all-option">219</IonSelectOption>
                                                <IonSelectOption value="221" class="all-option">221</IonSelectOption>
                                                <IonSelectOption value="227" class="all-option">227</IonSelectOption>
                                                <IonSelectOption value="228" class="all-option">228</IonSelectOption>
                                                <IonSelectOption value="229A" class="all-option">229A</IonSelectOption>
                                                <IonSelectOption value="229B" class="all-option">229B</IonSelectOption>
                                                <IonSelectOption value="229C" class="all-option">229C</IonSelectOption>
                                                <IonSelectOption value="230" class="all-option">230</IonSelectOption>
                                                <IonSelectOption value="231" class="all-option">231</IonSelectOption>
                                                <IonSelectOption value="232" class="all-option">232</IonSelectOption>
                                                <IonSelectOption value="235" class="all-option">235</IonSelectOption>
                                                <IonSelectOption value="240A" class="all-option">240A</IonSelectOption>
                                                <IonSelectOption value="240B" class="all-option">240B</IonSelectOption>
                                                <IonSelectOption value="250A" class="all-option">250A</IonSelectOption>
                                                <IonSelectOption value="250E" class="all-option">250E</IonSelectOption>
                                                <IonSelectOption value="250F" class="all-option">250F</IonSelectOption>
                                                <IonSelectOption value="250G" class="all-option">250G</IonSelectOption>
                                                <IonSelectOption value="250J" class="all-option">250J</IonSelectOption>
                                                <IonSelectOption value="250N" class="all-option">250N</IonSelectOption>
                                                <IonSelectOption value="250R" class="all-option">250R</IonSelectOption>
                                                <IonSelectOption value="250V" class="all-option">250V</IonSelectOption>
                                                <IonSelectOption value="250X" class="all-option">250X</IonSelectOption>
                                                <IonSelectOption value="C254" class="all-option">C254</IonSelectOption>
                                                <IonSelectOption value="C261" class="all-option">C261</IonSelectOption>
                                                <IonSelectOption value="C262A" class="all-option">C262A</IonSelectOption>
                                                <IonSelectOption value="C262B" class="all-option">C262B</IonSelectOption>
                                                <IonSelectOption value="270A" class="all-option">270A</IonSelectOption>
                                                <IonSelectOption value="270B" class="all-option">270B</IonSelectOption>
                                                <IonSelectOption value="C273" class="all-option">C273</IonSelectOption>
                                                <IonSelectOption value="280B" class="all-option">280B</IonSelectOption>
                                                <IonSelectOption value="280C" class="all-option">280C</IonSelectOption>
                                                <IonSelectOption value="280D" class="all-option">280D</IonSelectOption>
                                                <IonSelectOption value="280X" class="all-option">280X</IonSelectOption>
                                                <IonSelectOption value="290" class="all-option">290</IonSelectOption>
                                                <IonSelectOption value="291" class="all-option">291</IonSelectOption>
                                                <IonSelectOption value="292" class="all-option">292</IonSelectOption>
                                                <IonSelectOption value="C292" class="all-option">C292</IonSelectOption>
                                                <IonSelectOption value="296A" class="all-option">296A</IonSelectOption>
                                                <IonSelectOption value="296B" class="all-option">296B</IonSelectOption>
                                                <IonSelectOption value="298" class="all-option">298</IonSelectOption>
                                                <IonSelectOption value="299" class="all-option">299</IonSelectOption>
                                                <IonSelectOption value="301" class="all-option">301</IonSelectOption>
                                                <IonSelectOption value="375" class="all-option">375</IonSelectOption>
                                                <IonSelectOption value="602" class="all-option">602</IonSelectOption>
                                              </>
                                              : postClassName === 'AST' ?
                                                <>
                                                  <IonSelectOption value="C210" class="all-option">C210</IonSelectOption>
                                                  <IonSelectOption value="C225" class="all-option">C225</IonSelectOption>
                                                  <IonSelectOption value="C239" class="all-option">C239</IonSelectOption>
                                                  <IonSelectOption value="C295R" class="all-option">C295R</IonSelectOption>
                                                  <IonSelectOption value="299" class="all-option">299</IonSelectOption>
                                                </>
                                                : postClassName === '' ?
                                                  <>
                                                  </>
                                                  : null
                              }
                            </>
                          </IonSelect>
                        </IonItem>
                      }
                    </IonFab>
                  </>
                }
                <IonFab horizontal="end" style={{
                  textAlign: "center", alignItems: "center",
                  alignSelf: "center", display: "flex", paddingTop: ""
                }}>
                  <IonButton onClick={takePicture} mode="ios" color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} fill='clear' disabled={prevPostUploading}>
                    <IonIcon icon={cameraOutline} />
                  </IonButton>
                  <IonButton
                    color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
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


              {photo && photo.length > 0 ? (
                <>
                  <FadeIn>
                    {photo.map((photo, index) => {
                      return (
                        <IonCard key={"photo_" + index.toString()}>
                          <IonImg src={photo?.webPath} />
                        </IonCard>
                      )
                    })}
                  </FadeIn>
                </>
              ) : <> <br></br><br></br> </>}

              {/* </div> */}
            </IonCard>
            {prevPostUploading &&
              <p style={{ textAlign: "center" }}>Wait until previous post has <br />uploaded to post again</p>}
          </IonContent>
        </IonModal>

        <IonContent fullscreen scrollY={false}>
          <Virtuoso
            ref={virtuosoRef}
            overscan={1000}
            // increaseViewportBy={{top : 0, bottom: 500}}
            defaultItemHeight={400}
            endReached={handleLoadPostsNextBatch}
            className="ion-content-scroll-host"
            data={posts}
            style={{ height: "100%" }}
            itemContent={(item) => {
              let post = posts[item];
              let index = item;
              return (
                <FadeIn key={post.key}>
                  <IonList inset={true} mode="ios">
                    <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate("post/" + post.key, 'forward'); }}>
                      <IonLabel class="ion-text-wrap">
                        <IonText color="medium">
                          {/* <FadeIn> */}
                          <IonAvatar
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserPageNavigation(post.uid);
                            }}
                            class="posts-avatar"
                          >
                            <ProfilePhoto uid={post.uid}></ProfilePhoto>
                          </IonAvatar>
                          {/* </FadeIn> */}
                          <p>
                            {post.userName}
                          </p>
                        </IonText>
                        {post.postType ? (
                          <IonFab vertical="top" horizontal="end" onClick={(e) => {
                            if (post.postType !== "general") {
                              e.stopPropagation();
                              dynamicNavigate("type/" + post.postType, 'forward');
                            }
                          }}>
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
                        <div style={{ height: "0.75vh", }}>{" "}</div>
                        {"className" in post && "classNumber" in post && post.className.length > 0 ?
                          <Linkify style={sensitiveToggled && "reports" in post && post.reports > 1 ? { filter: "blur(0.25em)" } : {}} tagName="h3" className="h2-message">
                            {post.message}
                            <IonNote
                              onClick={(e) => {
                                e.stopPropagation();
                                dynamicNavigate("class/" + post.className, 'forward');
                              }}
                              color="medium"
                              style={{ fontWeight: "400" }}
                            >
                              &nbsp; — {post.className}{post.classNumber}
                            </IonNote>
                          </Linkify>
                          :
                          <Linkify style={sensitiveToggled && "reports" in post && post.reports > 1 ? { filter: "blur(0.25em)" } : {}} tagName="h3" className="h2-message">
                            {post.message}
                          </Linkify>
                        }

                        <PostImages isSensitive={sensitiveToggled} post={post} imgLoad={handleImgLoad} />

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
                        disabled={disabledLikeButtons === index || Object.keys(post.likes).length - 1 === -1}
                        mode="ios"
                        fill="outline"
                        color={
                          user &&
                            post.likes[user.uid] !== undefined && schoolName !== "Cal Poly Humboldt"
                            ? "primary"
                            : user && post.likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && schoolColorToggled
                              ? "tertiary"
                              : user && post.likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && !schoolColorToggled
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
                        disabled={disabledLikeButtons === index || Object.keys(post.dislikes).length - 1 === -1}
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
                      {"reports" in post && post.reports > 1 &&
                        <IonFab horizontal="end">
                          <IonIcon icon={warningSharp} color="warning" onClick={() => {
                            Dialog.alert({
                              title: "Flagged Post",
                              message: 'Post has been reported as sensitive/objectionable'
                            })
                          }}></IonIcon>
                        </IonFab>
                      }
                      {/* <IonButton color="medium" slot="end" onClick={() => { sharePost(post); }}>
                      <IonIcon icon={shareOutline} />
                    </IonButton> */}
                      {/* <IonNote>&nbsp;&nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{post.className}{post.classNumber}</IonNote> */}
                    </IonItem>
                  </IonList>
                </FadeIn>
              )
            }}
            components={{ Footer, Header }} />
        </IonContent>
      </IonPage >
    )
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

          <IonHeader class="ion-no-border" style={ionHeaderStyle}>
            <TellUHeader />
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
              && schoolColorToggled
              ? "tertiary"
              : "primary"
          }
        />
      </div>
    )
  }
});

export default React.memo(Home);