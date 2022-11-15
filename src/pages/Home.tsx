import "../App.css";
import "../theme/variables.css";

import {
  IonAvatar, IonButton, IonButtons, IonCard, IonCheckbox, IonCol,
  IonContent, IonFab, IonFabButton, IonFooter, IonGrid, IonHeader, IonIcon,
  IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList,
  IonLoading, IonModal, IonNote, IonPage, IonProgressBar, IonRefresher, IonRefresherContent,
  IonRow, IonSelect, IonSelectOption, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar,
} from "@ionic/react";
import { Camera, GalleryPhoto } from "@capacitor/camera";
import { Image as CapacitorImage, PhotoViewer as CapacitorPhotoViewer } from '@capacitor-community/photoviewer';
import { Geolocation, GeolocationOptions, Geoposition } from "@awesome-cordova-plugins/geolocation";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import TellUHeader, { ionHeaderStyle } from "./Header";
import { RefresherEventDetail, RouterDirection } from "@ionic/core";
import { add, cameraOutline, refreshCircleOutline, reloadCircleOutline, warningSharp } from "ionicons/icons";
import { addMessage, downVote, getAllPosts, promiseTimeout, upVote } from "../fbconfig";
import auth, { getAllPostsNextBatch, getLikes, storage } from "../fbconfig";
import { caretUpOutline, chevronDownCircleOutline } from "ionicons/icons";
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
  const [checkboxSelection, setCheckboxSelection] = useState<string>("general");
  const [locationPinModal, setLocationPinModal] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [selectOptions, setSelectOptions] = useState<any>({});
  const [selectFilterOptions, setFilterSelectOptions] = useState<any>({});
  const [selectOptionsNumber, setSelectOptionsNumber] = useState<any>({});
  const [filterClassName, setFilterClassName] = useState<string>("");
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
        setResearchChecked(false);
        setHousingChecked(false);
        break;
      case "alert":
        setGeneralChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        break;
      case "buySell":
        setAlertChecked(false);
        setGeneralChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        break;
      case "event":
        setAlertChecked(false);
        setBuySellChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        break;
      case "sighting":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        setResearchChecked(false);
        setHousingChecked(false);
        break;
      case "research":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        setHousingChecked(false);
        break;
      case "housing":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        setResearchChecked(false);
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
      // const image = await Camera.getPhoto({
      //   quality: 90,
      //   allowEditing: false,
      //   source: CameraSource.Prompt,
      //   resultType: CameraResultType.Uri,
      // });
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
      !housingChecked
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
      })
      setFilterSelectOptions({
        cssClass: 'my-custom-interface',
        header: 'Class Filter',
        subHeader: 'See posts about a specifc class'
      })
    } else {
      setSelectOptions({
        header: 'Class',
        subHeader: 'Select a class to post about'
      })
      setSelectOptionsNumber({
        header: 'Class Number',
        subHeader: 'Select a class number'
      })
      setFilterSelectOptions({
        header: 'Class Filter',
        subHeader: 'See posts about a specifc class'
      })
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
      tabs.setShowTabs(true);
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

  const Header = () => {
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
  }


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
                <IonProgressBar type="indeterminate" style={{ height: "1vh" }}></IonProgressBar>
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
            overscan={2500}
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

                        <PostImages isSensitive={sensitiveToggled} post={post} />

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
      </IonPage>
    )
    // return (
    //   <IonPage ref={pageRef}>
    //     <IonContent ref={contentRef} scrollEvents={true} fullscreen={true} onIonScroll={(e) => {
    //       setScrollPosition(e.detail.scrollTop);
    //       if (scrollPosition < 100) {
    //         setNewPostsLoaded(false);
    //       }
    //     }}>
    //       {newPostsLoaded && scrollPosition >= 100 ? (
    //         <IonFab style={{ top: "5vh" }} horizontal="center" slot="fixed">
    //           <IonFabButton color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} className="load-new-posts" mode="ios" onClick={() => { setNewPostsLoaded(false); scrollToTop(); }}>New Posts <IonIcon icon={caretUpOutline} /> </IonFabButton>
    //         </IonFab>
    //       ) : (null)}

    //       <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
    //         <IonRefresherContent
    //           pullingText="Pull to refresh"
    //           refreshingSpinner="crescent"
    //           refreshingText="Refreshing..."
    //         ></IonRefresherContent>
    //       </IonRefresher>

    //       <IonLoading
    //         spinner="dots"
    //         message="Getting Location..."
    //         duration={0}
    //         isOpen={gettingLocation}
    //       ></IonLoading>

    //       <FadeIn transitionDuration={500}>
    //         <IonHeader class="ion-no-border" style={ionHeaderStyle} >
    //           <Header darkMode={darkModeToggled} colorPallete={schoolColorToggled} schoolName={schoolName} zoom={1} />
    //         </IonHeader>
    //         {/* {schoolName && schoolName === "Cal Poly Humboldt" &&
    //           <IonFab horizontal="end">
    //             <IonSelect
    //               interface="action-sheet"
    //               interfaceOptions={selectFilterOptions}
    //               okText="Select"
    //               cancelText="Cancel"
    //               mode="ios"
    //               value={filterClassName}
    //               placeholder="Filter "
    //               onIonChange={(e: any) => {
    //                 setFilterClassName(e.detail.value);
    //               }}
    //             >
    //               <IonSelectOption value="AIE" class="all-option">AIE</IonSelectOption>
    //               <IonSelectOption value="ANTH" class="all-option">ANTH</IonSelectOption>
    //               <IonSelectOption value="ART" class="all-option">ART</IonSelectOption>
    //               <IonSelectOption value="AHSS" class="all-option">AHSS</IonSelectOption>
    //               <IonSelectOption value="BIOL" class="all-option">BIOL</IonSelectOption>
    //               <IonSelectOption value="BOT" class="all-option">BOT</IonSelectOption>
    //               <IonSelectOption value="BA" class="all-option">BA</IonSelectOption>
    //               <IonSelectOption value="CHEM" class="all-option">CHEM</IonSelectOption>
    //               <IonSelectOption value="CD" class="all-option">CD</IonSelectOption>
    //               <IonSelectOption value="COMM" class="all-option">COMM</IonSelectOption>
    //               <IonSelectOption value="CS" class="all-option">CS</IonSelectOption>
    //               <IonSelectOption value="CRIM" class="all-option">CRIM</IonSelectOption>
    //               <IonSelectOption value="CRGS" class="all-option">CRGS</IonSelectOption>
    //               <IonSelectOption value="DANC" class="all-option">DANC</IonSelectOption>
    //               <IonSelectOption value="ECON" class="all-option">ECON</IonSelectOption>
    //               <IonSelectOption value="EDUC" class="all-option">EDUC</IonSelectOption>
    //               <IonSelectOption value="EDL" class="all-option">EDL</IonSelectOption>
    //               <IonSelectOption value="ENGR" class="all-option">ENGR</IonSelectOption>
    //               <IonSelectOption value="ENGL" class="all-option">ENGL</IonSelectOption>
    //               <IonSelectOption value="ESM" class="all-option">ESM</IonSelectOption>
    //               <IonSelectOption value="ENST" class="all-option">ENST</IonSelectOption>
    //               <IonSelectOption value="ES" class="all-option">ES</IonSelectOption>
    //               <IonSelectOption value="FILM" class="all-option">FILM</IonSelectOption>
    //               <IonSelectOption value="FISH" class="all-option">FISH</IonSelectOption>
    //               <IonSelectOption value="FOR" class="all-option">FOR</IonSelectOption>
    //               <IonSelectOption value="FREN" class="all-option">FREN</IonSelectOption>
    //               <IonSelectOption value="GEOG" class="all-option">GEOG</IonSelectOption>
    //               <IonSelectOption value="GEOL" class="all-option">GEOL</IonSelectOption>
    //               <IonSelectOption value="GSP" class="all-option">GSP</IonSelectOption>
    //               <IonSelectOption value="GERM" class="all-option">GERM</IonSelectOption>
    //               <IonSelectOption value="HED" class="all-option">HED</IonSelectOption>
    //               <IonSelectOption value="HIST" class="all-option">HIST</IonSelectOption>
    //               <IonSelectOption value="JMC" class="all-option">JMC</IonSelectOption>
    //               <IonSelectOption value="KINS" class="all-option">KINS</IonSelectOption>
    //               <IonSelectOption value="MATH" class="all-option">MATH</IonSelectOption>
    //               <IonSelectOption value="MUS" class="all-option">MUS</IonSelectOption>
    //               <IonSelectOption value="NAS" class="all-option">NAS</IonSelectOption>
    //               <IonSelectOption value="OCN" class="all-option">OCN</IonSelectOption>
    //               <IonSelectOption value="PHIL" class="all-option">PHIL</IonSelectOption>
    //               <IonSelectOption value="PSCI" class="all-option">PSCI</IonSelectOption>
    //               <IonSelectOption value="PSYC" class="all-option">PYSC</IonSelectOption>
    //               <IonSelectOption value="RS" class="all-option">RS</IonSelectOption>
    //               <IonSelectOption value="SPAN" class="all-option">SPAN</IonSelectOption>
    //               <IonSelectOption value="STAT" class="all-option">STAT</IonSelectOption>
    //               <IonSelectOption value="TA" class="all-option">TA</IonSelectOption>
    //               <IonSelectOption value="WLDF" class="all-option">WLDF</IonSelectOption>
    //               <IonSelectOption value="WS" class="all-option">WS</IonSelectOption>
    //               <IonSelectOption value="ZOOL" class="all-option">ZOOL</IonSelectOption>
    //             </IonSelect>
    //           </IonFab>
    //         } */}
    //       </FadeIn>

    //       {/* <IonFab horizontal="end">
    //         <IonItem mode="ios">
    //           <IonSelect
    //             interface="action-sheet"
    //             interfaceOptions={selectOptions}
    //             okText="Select"
    //             cancelText="Cancel"
    //             mode="ios"
    //             value={postClassName}
    //             placeholder="Class: "
    //             onIonChange={(e: any) => {
    //               setPostClassNumber("");
    //               setPostClassName(e.detail.value);
    //             }}
    //           >
    //             <IonSelectOption value="AIE" class="all-option">AIE</IonSelectOption>
    //           </IonSelect>
    //         </IonItem>
    //       </IonFab> */}

    //       <IonModal
    //         isOpen={locationPinModal}
    //         onDidDismiss={() => {
    //           setLocationPinModal(false);
    //           handleCheckboxChange("general");
    //         }}
    //         breakpoints={[0, 0.99]}
    //         initialBreakpoint={0.99}
    //         handle={false}
    //       >
    //         {/* <IonContent> */}
    //         <IonHeader translucent>
    //           <IonToolbar mode="ios">
    //             <IonTitle>Post</IonTitle>
    //             <IonButtons slot="start">
    //               <IonButton
    //                 color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
    //                 mode="ios"
    //                 onClick={() => {
    //                   setLocationPinModal(false);
    //                 }}
    //               >
    //                 Back
    //               </IonButton>
    //             </IonButtons>
    //           </IonToolbar>
    //         </IonHeader>
    //         <IonList inset={true} mode="ios">
    //           {/* <IonListHeader mode="ios">Select One</IonListHeader> */}
    //           <IonItem lines="none" mode="ios">
    //             <IonLabel>General</IonLabel>
    //             <IonCheckbox
    //               id="generalCheckbox"
    //               checked={generalChecked}
    //               slot="start"
    //               onIonChange={(e) => {
    //                 handleCheckboxChange("general");
    //                 setGeneralChecked(e.detail.checked);
    //                 if (e.detail.checked) setCheckboxSelection("general");
    //               }}
    //             ></IonCheckbox>
    //           </IonItem>
    //           <IonItem lines="none" mode="ios">
    //             <IonLabel>Alert</IonLabel>
    //             <IonCheckbox
    //               id="alertCheckbox"
    //               checked={alertChecked}
    //               slot="start"
    //               onIonChange={(e) => {
    //                 handleCheckboxChange("alert");
    //                 setAlertChecked(e.detail.checked);
    //                 if (e.detail.checked) setCheckboxSelection("alert");
    //               }}
    //             ></IonCheckbox>
    //           </IonItem>
    //           <IonItem lines="none" mode="ios">
    //             <IonLabel>Buy/Sell</IonLabel>
    //             <IonCheckbox
    //               id="buySellCheckbox"
    //               checked={buySellChecked}
    //               slot="start"
    //               onIonChange={(e) => {
    //                 handleCheckboxChange("buySell");
    //                 setBuySellChecked(e.detail.checked);
    //                 if (e.detail.checked) setCheckboxSelection("buy/Sell");
    //               }}
    //             ></IonCheckbox>
    //           </IonItem>
    //           <IonItem lines="none" mode="ios">
    //             <IonLabel>Sighting</IonLabel>
    //             <IonCheckbox
    //               id="sightingCheckbox"
    //               checked={sightingChecked}
    //               slot="start"
    //               onIonChange={(e) => {
    //                 handleCheckboxChange("sighting");
    //                 setSightingChecked(e.detail.checked);
    //                 if (e.detail.checked) setCheckboxSelection("sighting");
    //               }}
    //             ></IonCheckbox>
    //           </IonItem>
    //           <IonItem lines="none" mode="ios">
    //             <IonLabel>Event</IonLabel>
    //             <IonCheckbox
    //               id="eventCheckbox"
    //               checked={eventsChecked}
    //               slot="start"
    //               onIonChange={(e) => {
    //                 handleCheckboxChange("event");
    //                 setEventsChecked(e.detail.checked);
    //                 if (e.detail.checked) setCheckboxSelection("event");
    //               }}
    //             ></IonCheckbox>
    //           </IonItem>
    //           <IonItem lines="none" mode="ios">
    //             <IonLabel>Research</IonLabel>
    //             <IonCheckbox
    //               id="researchCheckbox"
    //               checked={researchChecked}
    //               slot="start"
    //               onIonChange={(e) => {
    //                 handleCheckboxChange("research");
    //                 setResearchChecked(e.detail.checked);
    //                 if (e.detail.checked) setCheckboxSelection("research");
    //               }}
    //             ></IonCheckbox>
    //           </IonItem>
    //           <IonItem lines="none" mode="ios">
    //             <IonLabel>Housing</IonLabel>
    //             <IonCheckbox
    //               id="housingCheckbox"
    //               checked={housingChecked}
    //               slot="start"
    //               onIonChange={(e) => {
    //                 handleCheckboxChange("housing");
    //                 setHousingChecked(e.detail.checked);
    //                 if (e.detail.checked) setCheckboxSelection("housing");
    //               }}
    //             ></IonCheckbox>
    //           </IonItem>
    //         </IonList>
    //         <IonList inset={true} mode="ios">
    //           <IonItem mode="ios" lines="none">
    //             <IonLabel> Add pin to map?*</IonLabel><Map />
    //             <IonCheckbox
    //               slot="start"
    //               checked={locationChecked}
    //               onIonChange={(e) => {
    //                 setLocationChecked(e.detail.checked);
    //                 if (e.detail.checked) getLocation();
    //                 else setPosition(null);
    //               }}
    //             />
    //           </IonItem>
    //         </IonList>
    //         <IonNote style={{ textAlign: "center" }}>*Location pin stays on map for up to two days</IonNote>
    //         <br />
    //         <div className="ion-button-container">
    //           <IonButton
    //             onClick={() => {
    //               handleSendMessage();
    //             }}
    //             expand="block"
    //             color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
    //             mode="ios"
    //             shape="round"
    //             fill="outline"
    //             id="message"
    //             style={{ width: "75vw" }}
    //           >
    //             Post
    //           </IonButton>
    //         </div>
    //         {/* </IonContent> */}
    //       </IonModal>

    //       <IonModal backdropDismiss={false} isOpen={showModal} animated mode='ios'
    //       >
    //         <IonContent ref={modalContentRef} scrollEvents={true}>
    //           <div style={{ width: "100%" }}>
    //             <IonToolbar mode="ios">
    //               <IonButtons slot="start">
    //                 <IonButton
    //                   color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
    //                   mode="ios"
    //                   onClick={() => {
    //                     setPhoto([]);
    //                     setBlob([]);
    //                     setPostClassName("");
    //                     setPostClassNumber("");
    //                     Keyboard.hide().then(() => {
    //                       setTimeout(() => setShowModal(false), 100)
    //                     }).catch((err) => {
    //                       setTimeout(() => setShowModal(false), 100)
    //                     });;
    //                   }}
    //                 >
    //                   Close
    //                 </IonButton>
    //               </IonButtons>
    //             </IonToolbar>
    //           </div>
    //           <IonCard >
    //             {/* <div> */}
    //               <IonRow class="ion-padding-top">
    //                 {profilePhoto ? (
    //                   <>
    //                     <IonCol size="2">
    //                       <IonAvatar>
    //                         <img
    //                           src={profilePhoto} />
    //                       </IonAvatar>
    //                     </IonCol>
    //                     <IonCol>
    //                       <IonTextarea
    //                         spellcheck={true}
    //                         ref={inputRef}
    //                         rows={4}
    //                         color="secondary"
    //                         maxlength={500}
    //                         disabled={prevPostUploading}
    //                         value={message}
    //                         placeholder="Start typing..."
    //                         id="message"
    //                         onIonChange={(e: any) => {
    //                           handleChange(e);
    //                         }}
    //                       ></IonTextarea>
    //                     </IonCol>
    //                   </>
    //                 )
    //                   : (
    //                     <>
    //                       <IonTextarea
    //                         spellcheck={true}
    //                         ref={inputRef}
    //                         rows={4}
    //                         color="secondary"
    //                         maxlength={500}
    //                         style={ionInputStyle}
    //                         value={message}
    //                         disabled={prevPostUploading}
    //                         placeholder="Start typing..."
    //                         id="message"
    //                         onIonChange={(e: any) => {
    //                           handleChange(e);
    //                         }}
    //                       ></IonTextarea>
    //                     </>
    //                   )}
    //               </IonRow>
    //               <br /> <br /> <br/>
    //               <IonRow>
    //                 {schoolName && schoolName === "Cal Poly Humboldt" &&
    //                   <IonFab horizontal="start" style={{
    //                     textAlign: "center", alignItems: "center",
    //                     alignSelf: "center", display: "flex", paddingTop: ""
    //                   }}>
    //                     <IonItem mode="ios">
    //                       <IonSelect
    //                         interface="action-sheet"
    //                         interfaceOptions={selectOptions}
    //                         okText="Select"
    //                         cancelText="Cancel"
    //                         mode="ios"
    //                         value={postClassName}
    //                         placeholder="Class: "
    //                         onIonChange={(e: any) => {
    //                           setPostClassNumber("");
    //                           setPostClassName(e.detail.value);
    //                         }}
    //                       >
    //                         <IonSelectOption value="AIE" class="all-option">AIE</IonSelectOption>
    //                         <IonSelectOption value="ANTH" class="all-option">ANTH</IonSelectOption>
    //                         <IonSelectOption value="ART" class="all-option">ART</IonSelectOption>
    //                         <IonSelectOption value="AHSS" class="all-option">AHSS</IonSelectOption>
    //                         <IonSelectOption value="BIOL" class="all-option">BIOL</IonSelectOption>
    //                         <IonSelectOption value="BOT" class="all-option">BOT</IonSelectOption>
    //                         <IonSelectOption value="BA" class="all-option">BA</IonSelectOption>
    //                         <IonSelectOption value="CHEM" class="all-option">CHEM</IonSelectOption>
    //                         <IonSelectOption value="CD" class="all-option">CD</IonSelectOption>
    //                         <IonSelectOption value="COMM" class="all-option">COMM</IonSelectOption>
    //                         <IonSelectOption value="CS" class="all-option">CS</IonSelectOption>
    //                         <IonSelectOption value="CRIM" class="all-option">CRIM</IonSelectOption>
    //                         <IonSelectOption value="CRGS" class="all-option">CRGS</IonSelectOption>
    //                         <IonSelectOption value="DANC" class="all-option">DANC</IonSelectOption>
    //                         <IonSelectOption value="ECON" class="all-option">ECON</IonSelectOption>
    //                         <IonSelectOption value="EDUC" class="all-option">EDUC</IonSelectOption>
    //                         <IonSelectOption value="EDL" class="all-option">EDL</IonSelectOption>
    //                         <IonSelectOption value="ENGR" class="all-option">ENGR</IonSelectOption>
    //                         <IonSelectOption value="ENGL" class="all-option">ENGL</IonSelectOption>
    //                         <IonSelectOption value="ESM" class="all-option">ESM</IonSelectOption>
    //                         <IonSelectOption value="ENST" class="all-option">ENST</IonSelectOption>
    //                         <IonSelectOption value="ES" class="all-option">ES</IonSelectOption>
    //                         <IonSelectOption value="FILM" class="all-option">FILM</IonSelectOption>
    //                         <IonSelectOption value="FISH" class="all-option">FISH</IonSelectOption>
    //                         <IonSelectOption value="FOR" class="all-option">FOR</IonSelectOption>
    //                         <IonSelectOption value="FREN" class="all-option">FREN</IonSelectOption>
    //                         <IonSelectOption value="GEOG" class="all-option">GEOG</IonSelectOption>
    //                         <IonSelectOption value="GEOL" class="all-option">GEOL</IonSelectOption>
    //                         <IonSelectOption value="GSP" class="all-option">GSP</IonSelectOption>
    //                         <IonSelectOption value="GERM" class="all-option">GERM</IonSelectOption>
    //                         <IonSelectOption value="HED" class="all-option">HED</IonSelectOption>
    //                         <IonSelectOption value="HIST" class="all-option">HIST</IonSelectOption>
    //                         <IonSelectOption value="JMC" class="all-option">JMC</IonSelectOption>
    //                         <IonSelectOption value="KINS" class="all-option">KINS</IonSelectOption>
    //                         <IonSelectOption value="MATH" class="all-option">MATH</IonSelectOption>
    //                         <IonSelectOption value="MUS" class="all-option">MUS</IonSelectOption>
    //                         <IonSelectOption value="NAS" class="all-option">NAS</IonSelectOption>
    //                         <IonSelectOption value="OCN" class="all-option">OCN</IonSelectOption>
    //                         <IonSelectOption value="PHIL" class="all-option">PHIL</IonSelectOption>
    //                         <IonSelectOption value="PSCI" class="all-option">PSCI</IonSelectOption>
    //                         <IonSelectOption value="PSYC" class="all-option">PYSC</IonSelectOption>
    //                         <IonSelectOption value="RS" class="all-option">RS</IonSelectOption>
    //                         <IonSelectOption value="SPAN" class="all-option">SPAN</IonSelectOption>
    //                         <IonSelectOption value="STAT" class="all-option">STAT</IonSelectOption>
    //                         <IonSelectOption value="TA" class="all-option">TA</IonSelectOption>
    //                         <IonSelectOption value="WLDF" class="all-option">WLDF</IonSelectOption>
    //                         <IonSelectOption value="WS" class="all-option">WS</IonSelectOption>
    //                         <IonSelectOption value="ZOOL" class="all-option">ZOOL</IonSelectOption>
    //                       </IonSelect>
    //                     </IonItem>
    //                     {postClassName && postClassName.length > 0 &&
    //                       <IonItem>
    //                         <IonSelect
    //                           interface="action-sheet"
    //                           interfaceOptions={selectOptionsNumber}
    //                           okText="Select"
    //                           cancelText="Cancel"
    //                           mode="ios"
    //                           value={postClassNumber}
    //                           placeholder="#:"
    //                           onIonChange={(e: any) => {
    //                             setPostClassNumber(e.detail.value);
    //                           }}
    //                         >
    //                           <>
    //                             {postClassName === 'AIE' ?
    //                               <>
    //                                 <IonSelectOption value="330" class="all-option">330</IonSelectOption>
    //                                 <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                               </>
    //                               : postClassName === 'ANTH' ?
    //                                 <>
    //                                   <IonSelectOption value="103" class="all-option">103</IonSelectOption>
    //                                   <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                   <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                   <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                   <IonSelectOption value="235" class="all-option">235</IonSelectOption>
    //                                   <IonSelectOption value="302" class="all-option">302</IonSelectOption>
    //                                   <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                   <IonSelectOption value="307" class="all-option">307</IonSelectOption>
    //                                   <IonSelectOption value="310" class="all-option">310</IonSelectOption>
    //                                   <IonSelectOption value="316" class="all-option">316</IonSelectOption>
    //                                   <IonSelectOption value="339" class="all-option">339</IonSelectOption>
    //                                   <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                   <IonSelectOption value="357" class="all-option">357</IonSelectOption>
    //                                   <IonSelectOption value="358" class="all-option">358</IonSelectOption>
    //                                   <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                   <IonSelectOption value="499" class="all-option">499</IonSelectOption>
    //                                 </>
    //                                 : postClassName === 'ART' ?
    //                                   <>
    //                                     <IonSelectOption value="103A" class="all-option">103A</IonSelectOption>
    //                                     <IonSelectOption value="103AB" class="all-option">103B</IonSelectOption>
    //                                     <IonSelectOption value="104I" class="all-option">104I</IonSelectOption>
    //                                     <IonSelectOption value="104J" class="all-option">104J</IonSelectOption>
    //                                     <IonSelectOption value="105B" class="all-option">105B</IonSelectOption>
    //                                     <IonSelectOption value="105C" class="all-option">105C</IonSelectOption>
    //                                     <IonSelectOption value="105D" class="all-option">105D</IonSelectOption>
    //                                     <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                     <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                     <IonSelectOption value="108" class="all-option">108</IonSelectOption>
    //                                     <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                     <IonSelectOption value="122" class="all-option">122</IonSelectOption>
    //                                     <IonSelectOption value="250" class="all-option">250</IonSelectOption>
    //                                     <IonSelectOption value="251" class="all-option">251</IonSelectOption>
    //                                     <IonSelectOption value="273" class="all-option">273</IonSelectOption>
    //                                     <IonSelectOption value="282" class="all-option">282</IonSelectOption>
    //                                     <IonSelectOption value="290" class="all-option">290</IonSelectOption>
    //                                     <IonSelectOption value="301" class="all-option">301</IonSelectOption>
    //                                     <IonSelectOption value="303" class="all-option">303</IonSelectOption>
    //                                     <IonSelectOption value="303M" class="all-option">303M</IonSelectOption>
    //                                     <IonSelectOption value="304" class="all-option">304</IonSelectOption>
    //                                     <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                     <IonSelectOption value="307" class="all-option">307</IonSelectOption>
    //                                     <IonSelectOption value="321" class="all-option">321</IonSelectOption>
    //                                     <IonSelectOption value="324" class="all-option">324</IonSelectOption>
    //                                     <IonSelectOption value="326" class="all-option">326</IonSelectOption>
    //                                     <IonSelectOption value="329" class="all-option">329</IonSelectOption>
    //                                     <IonSelectOption value="330" class="all-option">330</IonSelectOption>
    //                                     <IonSelectOption value="337" class="all-option">337</IonSelectOption>
    //                                     <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                                     <IonSelectOption value="346" class="all-option">346</IonSelectOption>
    //                                     <IonSelectOption value="348" class="all-option">348</IonSelectOption>
    //                                     <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                     <IonSelectOption value="351" class="all-option">351</IonSelectOption>
    //                                     <IonSelectOption value="356" class="all-option">356</IonSelectOption>
    //                                     <IonSelectOption value="356M" class="all-option">356M</IonSelectOption>
    //                                     <IonSelectOption value="357B" class="all-option">357B</IonSelectOption>
    //                                     <IonSelectOption value="359" class="all-option">359</IonSelectOption>
    //                                     <IonSelectOption value="367" class="all-option">367</IonSelectOption>
    //                                     <IonSelectOption value="372" class="all-option">372</IonSelectOption>
    //                                     <IonSelectOption value="395" class="all-option">395</IonSelectOption>
    //                                     <IonSelectOption value="437" class="all-option">437</IonSelectOption>
    //                                     <IonSelectOption value="491A" class="all-option">491A</IonSelectOption>
    //                                     <IonSelectOption value="499" class="all-option">499</IonSelectOption>
    //                                   </>
    //                                   : postClassName === 'AHSS' ?
    //                                     <>
    //                                       <IonSelectOption value="100" class="all-option">100</IonSelectOption>
    //                                       <IonSelectOption value="101" class="all-option">101</IonSelectOption>
    //                                       <IonSelectOption value="102" class="all-option">102</IonSelectOption>
    //                                       <IonSelectOption value="108" class="all-option">108</IonSelectOption>
    //                                       <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                       <IonSelectOption value="180" class="all-option">180</IonSelectOption>
    //                                     </>
    //                                     : postClassName === 'BIOL' ?
    //                                       <>
    //                                         <IonSelectOption value="102" class="all-option">102</IonSelectOption>
    //                                         <IonSelectOption value="102L" class="all-option">102L</IonSelectOption>
    //                                         <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                         <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                         <IonSelectOption value="198" class="all-option">198</IonSelectOption>
    //                                         <IonSelectOption value="255" class="all-option">255</IonSelectOption>
    //                                         <IonSelectOption value="304" class="all-option">304</IonSelectOption>
    //                                         <IonSelectOption value="307" class="all-option">307</IonSelectOption>
    //                                         <IonSelectOption value="330" class="all-option">330</IonSelectOption>
    //                                         <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                                         <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                         <IonSelectOption value="412" class="all-option">412</IonSelectOption>
    //                                         <IonSelectOption value="433" class="all-option">433</IonSelectOption>
    //                                         <IonSelectOption value="433D" class="all-option">433D</IonSelectOption>
    //                                         <IonSelectOption value="434" class="all-option">434</IonSelectOption>
    //                                         <IonSelectOption value="440" class="all-option">440</IonSelectOption>
    //                                         <IonSelectOption value="450" class="all-option">450</IonSelectOption>
    //                                         <IonSelectOption value="480" class="all-option">480</IonSelectOption>
    //                                         <IonSelectOption value="480L" class="all-option">480L</IonSelectOption>
    //                                         <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                         <IonSelectOption value="499" class="all-option">499</IonSelectOption>
    //                                         <IonSelectOption value="533" class="all-option">533</IonSelectOption>
    //                                         <IonSelectOption value="533D" class="all-option">533D</IonSelectOption>
    //                                         <IonSelectOption value="534" class="all-option">534</IonSelectOption>
    //                                         <IonSelectOption value="580" class="all-option">580</IonSelectOption>
    //                                         <IonSelectOption value="597" class="all-option">597</IonSelectOption>
    //                                         <IonSelectOption value="683" class="all-option">683</IonSelectOption>
    //                                         <IonSelectOption value="685" class="all-option">685</IonSelectOption>
    //                                         <IonSelectOption value="690" class="all-option">690</IonSelectOption>
    //                                         <IonSelectOption value="699" class="all-option">699</IonSelectOption>
    //                                       </>
    //                                       : postClassName === 'BOT' ?
    //                                         <>
    //                                           <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                           <IonSelectOption value="198" class="all-option">198</IonSelectOption>
    //                                           <IonSelectOption value="310" class="all-option">310</IonSelectOption>
    //                                           <IonSelectOption value="330" class="all-option">330</IonSelectOption>
    //                                           <IonSelectOption value="330L" class="all-option">330L</IonSelectOption>
    //                                           <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                           <IonSelectOption value="354" class="all-option">354</IonSelectOption>
    //                                           <IonSelectOption value="354A" class="all-option">354A</IonSelectOption>
    //                                           <IonSelectOption value="358" class="all-option">358</IonSelectOption>
    //                                           <IonSelectOption value="360" class="all-option">360</IonSelectOption>
    //                                           <IonSelectOption value="360L" class="all-option">360L</IonSelectOption>
    //                                         </>
    //                                         : postClassName === 'BA' ?
    //                                           <>
    //                                             <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                             <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                             <IonSelectOption value="202" class="all-option">202</IonSelectOption>
    //                                             <IonSelectOption value="250" class="all-option">250</IonSelectOption>
    //                                             <IonSelectOption value="252" class="all-option">252</IonSelectOption>
    //                                             <IonSelectOption value="322" class="all-option">322</IonSelectOption>
    //                                             <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                                             <IonSelectOption value="360" class="all-option">360</IonSelectOption>
    //                                             <IonSelectOption value="370" class="all-option">370</IonSelectOption>
    //                                             <IonSelectOption value="422" class="all-option">422</IonSelectOption>
    //                                             <IonSelectOption value="430" class="all-option">430</IonSelectOption>
    //                                             <IonSelectOption value="432" class="all-option">432</IonSelectOption>
    //                                             <IonSelectOption value="433" class="all-option">433</IonSelectOption>
    //                                             <IonSelectOption value="446" class="all-option">446</IonSelectOption>
    //                                             <IonSelectOption value="449" class="all-option">449</IonSelectOption>
    //                                             <IonSelectOption value="450" class="all-option">450</IonSelectOption>
    //                                             <IonSelectOption value="453" class="all-option">453</IonSelectOption>
    //                                             <IonSelectOption value="454" class="all-option">454</IonSelectOption>
    //                                             <IonSelectOption value="456" class="all-option">456</IonSelectOption>
    //                                             <IonSelectOption value="462" class="all-option">462</IonSelectOption>
    //                                             <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                             <IonSelectOption value="496" class="all-option">496</IonSelectOption>
    //                                           </>
    //                                           : postClassName === 'CHEM' ?
    //                                             <>
    //                                               <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                               <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                               <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                               <IonSelectOption value="198" class="all-option">198</IonSelectOption>
    //                                               <IonSelectOption value="228" class="all-option">228</IonSelectOption>
    //                                               <IonSelectOption value="324" class="all-option">324</IonSelectOption>
    //                                               <IonSelectOption value="324L" class="all-option">324L</IonSelectOption>
    //                                               <IonSelectOption value="330" class="all-option">330</IonSelectOption>
    //                                               <IonSelectOption value="341" class="all-option">341</IonSelectOption>
    //                                               <IonSelectOption value="361" class="all-option">361</IonSelectOption>
    //                                               <IonSelectOption value="370" class="all-option">370</IonSelectOption>
    //                                               <IonSelectOption value="434" class="all-option">434</IonSelectOption>
    //                                               <IonSelectOption value="434L" class="all-option">434L</IonSelectOption>
    //                                               <IonSelectOption value="438" class="all-option">438</IonSelectOption>
    //                                               <IonSelectOption value="485" class="all-option">485</IonSelectOption>
    //                                             </>
    //                                             : postClassName === 'CD' ?
    //                                               <>
    //                                                 <IonSelectOption value="109Y" class="all-option">109Y</IonSelectOption>
    //                                                 <IonSelectOption value="109Z" class="all-option">109Z</IonSelectOption>
    //                                                 <IonSelectOption value="209" class="all-option">209</IonSelectOption>
    //                                                 <IonSelectOption value="211" class="all-option">211</IonSelectOption>
    //                                                 <IonSelectOption value="211S" class="all-option">211S</IonSelectOption>
    //                                                 <IonSelectOption value="251" class="all-option">251</IonSelectOption>
    //                                                 <IonSelectOption value="253" class="all-option">253</IonSelectOption>
    //                                                 <IonSelectOption value="257" class="all-option">257</IonSelectOption>
    //                                                 <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                                 <IonSelectOption value="355" class="all-option">355</IonSelectOption>
    //                                                 <IonSelectOption value="362" class="all-option">362</IonSelectOption>
    //                                                 <IonSelectOption value="366" class="all-option">366</IonSelectOption>
    //                                                 <IonSelectOption value="467" class="all-option">467</IonSelectOption>
    //                                                 <IonSelectOption value="469" class="all-option">469</IonSelectOption>
    //                                                 <IonSelectOption value="479" class="all-option">479</IonSelectOption>
    //                                                 <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                               </>
    //                                               : postClassName === 'COMM' ?
    //                                                 <>
    //                                                   <IonSelectOption value="100" class="all-option">100</IonSelectOption>
    //                                                   <IonSelectOption value="103" class="all-option">103</IonSelectOption>
    //                                                   <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                   <IonSelectOption value="108" class="all-option">108</IonSelectOption>
    //                                                   <IonSelectOption value="214" class="all-option">214</IonSelectOption>
    //                                                   <IonSelectOption value="235" class="all-option">235</IonSelectOption>
    //                                                   <IonSelectOption value="300" class="all-option">300</IonSelectOption>
    //                                                   <IonSelectOption value="309B" class="all-option">309B</IonSelectOption>
    //                                                   <IonSelectOption value="319" class="all-option">319</IonSelectOption>
    //                                                   <IonSelectOption value="411" class="all-option">411</IonSelectOption>
    //                                                   <IonSelectOption value="414" class="all-option">414</IonSelectOption>
    //                                                   <IonSelectOption value="480" class="all-option">480</IonSelectOption>
    //                                                   <IonSelectOption value="490" class="all-option">490</IonSelectOption>
    //                                                 </>
    //                                                 : postClassName === 'CS' ?
    //                                                   <>
    //                                                     <IonSelectOption value="100" class="all-option">100</IonSelectOption>
    //                                                     <IonSelectOption value="111" class="all-option">111</IonSelectOption>
    //                                                     <IonSelectOption value="112" class="all-option">112</IonSelectOption>
    //                                                     <IonSelectOption value="211" class="all-option">211</IonSelectOption>
    //                                                     <IonSelectOption value="243" class="all-option">243</IonSelectOption>
    //                                                     <IonSelectOption value="279" class="all-option">279</IonSelectOption>
    //                                                     <IonSelectOption value="309" class="all-option">309</IonSelectOption>
    //                                                     <IonSelectOption value="312" class="all-option">312</IonSelectOption>
    //                                                     <IonSelectOption value="325" class="all-option">325</IonSelectOption>
    //                                                     <IonSelectOption value="346" class="all-option">346</IonSelectOption>
    //                                                     <IonSelectOption value="374" class="all-option">374</IonSelectOption>
    //                                                     <IonSelectOption value="458" class="all-option">458</IonSelectOption>
    //                                                     <IonSelectOption value="480" class="all-option">480</IonSelectOption>
    //                                                   </>
    //                                                   : postClassName === 'CRIM' ?
    //                                                     <>
    //                                                       <IonSelectOption value="125" class="all-option">125</IonSelectOption>
    //                                                       <IonSelectOption value="225" class="all-option">225</IonSelectOption>
    //                                                       <IonSelectOption value="325" class="all-option">325</IonSelectOption>
    //                                                       <IonSelectOption value="362" class="all-option">362</IonSelectOption>
    //                                                       <IonSelectOption value="410" class="all-option">410</IonSelectOption>
    //                                                       <IonSelectOption value="420" class="all-option">420</IonSelectOption>
    //                                                     </>
    //                                                     : postClassName === 'CRGS' ?
    //                                                       <>
    //                                                         <IonSelectOption value="108" class="all-option">108</IonSelectOption>
    //                                                         <IonSelectOption value="118" class="all-option">118</IonSelectOption>
    //                                                         <IonSelectOption value="235" class="all-option">235</IonSelectOption>
    //                                                         <IonSelectOption value="313" class="all-option">313</IonSelectOption>
    //                                                         <IonSelectOption value="331" class="all-option">331</IonSelectOption>
    //                                                         <IonSelectOption value="360" class="all-option">360</IonSelectOption>
    //                                                         <IonSelectOption value="390" class="all-option">390</IonSelectOption>
    //                                                         <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                                         <IonSelectOption value="491" class="all-option">491</IonSelectOption>
    //                                                       </>
    //                                                       : postClassName === 'DANC' ?
    //                                                         <>
    //                                                           <IonSelectOption value="103" class="all-option">103</IonSelectOption>
    //                                                           <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                           <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                                           <IonSelectOption value="243" class="all-option">243</IonSelectOption>
    //                                                           <IonSelectOption value="245" class="all-option">245</IonSelectOption>
    //                                                           <IonSelectOption value="247" class="all-option">247</IonSelectOption>
    //                                                           <IonSelectOption value="248" class="all-option">248</IonSelectOption>
    //                                                           <IonSelectOption value="303" class="all-option">303</IonSelectOption>
    //                                                           <IonSelectOption value="320" class="all-option">320</IonSelectOption>
    //                                                           <IonSelectOption value="352" class="all-option">352</IonSelectOption>
    //                                                           <IonSelectOption value="354" class="all-option">354</IonSelectOption>
    //                                                           <IonSelectOption value="389" class="all-option">389</IonSelectOption>
    //                                                           <IonSelectOption value="488" class="all-option">488</IonSelectOption>
    //                                                           <IonSelectOption value="499" class="all-option">499</IonSelectOption>
    //                                                         </>
    //                                                         : postClassName === 'ECON' ?
    //                                                           <>
    //                                                             <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                             <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                             <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                             <IonSelectOption value="311" class="all-option">311</IonSelectOption>
    //                                                             <IonSelectOption value="423" class="all-option">423</IonSelectOption>
    //                                                             <IonSelectOption value="435" class="all-option">435</IonSelectOption>
    //                                                             <IonSelectOption value="550" class="all-option">550</IonSelectOption>
    //                                                           </>
    //                                                           : postClassName === 'EDUC' ?
    //                                                             <>
    //                                                               <IonSelectOption value="101" class="all-option">101</IonSelectOption>
    //                                                               <IonSelectOption value="377" class="all-option">377</IonSelectOption>
    //                                                               <IonSelectOption value="610" class="all-option">610</IonSelectOption>
    //                                                               <IonSelectOption value="620" class="all-option">620</IonSelectOption>

    //                                                             </>
    //                                                             : postClassName === 'EDL' ?
    //                                                               <>
    //                                                                 <IonSelectOption value="645" class="all-option">645</IonSelectOption>
    //                                                                 <IonSelectOption value="646" class="all-option">646</IonSelectOption>
    //                                                                 <IonSelectOption value="649" class="all-option">649</IonSelectOption>
    //                                                                 <IonSelectOption value="660" class="all-option">660</IonSelectOption>
    //                                                                 <IonSelectOption value="694" class="all-option">694</IonSelectOption>
    //                                                                 <IonSelectOption value="695" class="all-option">695</IonSelectOption>
    //                                                               </>
    //                                                               : postClassName === 'ENGR' ?
    //                                                                 <>
    //                                                                   <IonSelectOption value="115" class="all-option">115</IonSelectOption>
    //                                                                   <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                                   <IonSelectOption value="211" class="all-option">211</IonSelectOption>
    //                                                                   <IonSelectOption value="215" class="all-option">215</IonSelectOption>
    //                                                                   <IonSelectOption value="225" class="all-option">225</IonSelectOption>
    //                                                                   <IonSelectOption value="280" class="all-option">280</IonSelectOption>
    //                                                                   <IonSelectOption value="299" class="all-option">299</IonSelectOption>
    //                                                                   <IonSelectOption value="308" class="all-option">308</IonSelectOption>
    //                                                                   <IonSelectOption value="313" class="all-option">313</IonSelectOption>
    //                                                                   <IonSelectOption value="322" class="all-option">322</IonSelectOption>
    //                                                                   <IonSelectOption value="325" class="all-option">325</IonSelectOption>
    //                                                                   <IonSelectOption value="326" class="all-option">326</IonSelectOption>
    //                                                                   <IonSelectOption value="330" class="all-option">330</IonSelectOption>
    //                                                                   <IonSelectOption value="331" class="all-option">331</IonSelectOption>
    //                                                                   <IonSelectOption value="333" class="all-option">333</IonSelectOption>
    //                                                                   <IonSelectOption value="351" class="all-option">351</IonSelectOption>
    //                                                                   <IonSelectOption value="371" class="all-option">371</IonSelectOption>
    //                                                                   <IonSelectOption value="399" class="all-option">399</IonSelectOption>
    //                                                                   <IonSelectOption value="410" class="all-option">410</IonSelectOption>
    //                                                                   <IonSelectOption value="416" class="all-option">416</IonSelectOption>
    //                                                                   <IonSelectOption value="418" class="all-option">418</IonSelectOption>
    //                                                                   <IonSelectOption value="440" class="all-option">440</IonSelectOption>
    //                                                                   <IonSelectOption value="453" class="all-option">453</IonSelectOption>
    //                                                                   <IonSelectOption value="471" class="all-option">471</IonSelectOption>
    //                                                                   <IonSelectOption value="492" class="all-option">492</IonSelectOption>
    //                                                                   <IonSelectOption value="496" class="all-option">496</IonSelectOption>
    //                                                                   <IonSelectOption value="498" class="all-option">498</IonSelectOption>
    //                                                                   <IonSelectOption value="518" class="all-option">518</IonSelectOption>
    //                                                                   <IonSelectOption value="532" class="all-option">532</IonSelectOption>
    //                                                                   <IonSelectOption value="571" class="all-option">571</IonSelectOption>
    //                                                                   <IonSelectOption value="690" class="all-option">690</IonSelectOption>
    //                                                                 </>
    //                                                                 : postClassName === 'ENGL' ?
    //                                                                   <>
    //                                                                     <IonSelectOption value="102" class="all-option">102</IonSelectOption>
    //                                                                     <IonSelectOption value="103" class="all-option">103</IonSelectOption>
    //                                                                     <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                                     <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                     <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                                                     <IonSelectOption value="211" class="all-option">211</IonSelectOption>
    //                                                                     <IonSelectOption value="218" class="all-option">218</IonSelectOption>
    //                                                                     <IonSelectOption value="220" class="all-option">220</IonSelectOption>
    //                                                                     <IonSelectOption value="240" class="all-option">240</IonSelectOption>
    //                                                                     <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                                     <IonSelectOption value="315" class="all-option">315</IonSelectOption>
    //                                                                     <IonSelectOption value="316" class="all-option">316</IonSelectOption>
    //                                                                     <IonSelectOption value="328" class="all-option">328</IonSelectOption>
    //                                                                     <IonSelectOption value="336" class="all-option">336</IonSelectOption>
    //                                                                     <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                                                     <IonSelectOption value="406" class="all-option">406</IonSelectOption>
    //                                                                     <IonSelectOption value="420" class="all-option">420</IonSelectOption>
    //                                                                     <IonSelectOption value="426" class="all-option">426</IonSelectOption>
    //                                                                     <IonSelectOption value="435" class="all-option">435</IonSelectOption>
    //                                                                     <IonSelectOption value="450" class="all-option">450</IonSelectOption>
    //                                                                     <IonSelectOption value="460" class="all-option">460</IonSelectOption>
    //                                                                     <IonSelectOption value="535" class="all-option">535</IonSelectOption>
    //                                                                     <IonSelectOption value="600" class="all-option">600</IonSelectOption>
    //                                                                   </>
    //                                                                   : postClassName === 'ESM' ?
    //                                                                     <>
    //                                                                       <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                       <IonSelectOption value="108" class="all-option">108</IonSelectOption>
    //                                                                       <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                                       <IonSelectOption value="230" class="all-option">230</IonSelectOption>
    //                                                                       <IonSelectOption value="253" class="all-option">253</IonSelectOption>
    //                                                                       <IonSelectOption value="303" class="all-option">303</IonSelectOption>
    //                                                                       <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                                                       <IonSelectOption value="308" class="all-option">308</IonSelectOption>
    //                                                                       <IonSelectOption value="309B" class="all-option">309B</IonSelectOption>
    //                                                                       <IonSelectOption value="325" class="all-option">325</IonSelectOption>
    //                                                                       <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                                                       <IonSelectOption value="355" class="all-option">355</IonSelectOption>
    //                                                                       <IonSelectOption value="360" class="all-option">360</IonSelectOption>
    //                                                                       <IonSelectOption value="411" class="all-option">411</IonSelectOption>
    //                                                                       <IonSelectOption value="425" class="all-option">425</IonSelectOption>
    //                                                                       <IonSelectOption value="435" class="all-option">435</IonSelectOption>
    //                                                                       <IonSelectOption value="450" class="all-option">450</IonSelectOption>
    //                                                                       <IonSelectOption value="455" class="all-option">455</IonSelectOption>
    //                                                                       <IonSelectOption value="462" class="all-option">462</IonSelectOption>
    //                                                                     </>
    //                                                                     : postClassName === 'ENST' ?
    //                                                                       <>
    //                                                                         <IonSelectOption value="120" class="all-option">120</IonSelectOption>
    //                                                                         <IonSelectOption value="123" class="all-option">123</IonSelectOption>
    //                                                                         <IonSelectOption value="395" class="all-option">395</IonSelectOption>
    //                                                                         <IonSelectOption value="490S" class="all-option">490S</IonSelectOption>
    //                                                                       </>
    //                                                                       : postClassName === 'ES' ?
    //                                                                         <>
    //                                                                           <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                           <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                                                           <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                           <IonSelectOption value="302" class="all-option">302</IonSelectOption>
    //                                                                           <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                                                           <IonSelectOption value="308" class="all-option">308</IonSelectOption>
    //                                                                           <IonSelectOption value="317" class="all-option">317</IonSelectOption>
    //                                                                           <IonSelectOption value="336" class="all-option">336</IonSelectOption>
    //                                                                         </>
    //                                                                         : postClassName === 'FILM' ?
    //                                                                           <>
    //                                                                             <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                                                             <IonSelectOption value="260" class="all-option">260</IonSelectOption>
    //                                                                             <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                                                             <IonSelectOption value="315" class="all-option">315</IonSelectOption>
    //                                                                             <IonSelectOption value="317" class="all-option">317</IonSelectOption>
    //                                                                             <IonSelectOption value="350" class="all-option">350</IonSelectOption>
    //                                                                             <IonSelectOption value="378" class="all-option">378</IonSelectOption>
    //                                                                             <IonSelectOption value="415" class="all-option">415</IonSelectOption>
    //                                                                             <IonSelectOption value="465" class="all-option">465</IonSelectOption>
    //                                                                           </>
    //                                                                           : postClassName === 'FISH' ?
    //                                                                             <>
    //                                                                               <IonSelectOption value="260" class="all-option">260</IonSelectOption>
    //                                                                               <IonSelectOption value="300" class="all-option">300</IonSelectOption>
    //                                                                               <IonSelectOption value="310" class="all-option">310</IonSelectOption>
    //                                                                               <IonSelectOption value="314" class="all-option">314</IonSelectOption>
    //                                                                               <IonSelectOption value="375" class="all-option">375</IonSelectOption>
    //                                                                               <IonSelectOption value="380" class="all-option">380</IonSelectOption>
    //                                                                               <IonSelectOption value="435" class="all-option">435</IonSelectOption>
    //                                                                               <IonSelectOption value="476" class="all-option">476</IonSelectOption>
    //                                                                               <IonSelectOption value="480" class="all-option">480</IonSelectOption>
    //                                                                               <IonSelectOption value="576" class="all-option">576</IonSelectOption>
    //                                                                               <IonSelectOption value="580" class="all-option">580</IonSelectOption>
    //                                                                               <IonSelectOption value="690" class="all-option">690</IonSelectOption>
    //                                                                               <IonSelectOption value="695" class="all-option">695</IonSelectOption>
    //                                                                             </>
    //                                                                             : postClassName === 'FOR' ?
    //                                                                               <>
    //                                                                                 <IonSelectOption value="170" class="all-option">170</IonSelectOption>
    //                                                                                 <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                                                 <IonSelectOption value="223" class="all-option">223</IonSelectOption>
    //                                                                                 <IonSelectOption value="250" class="all-option">250</IonSelectOption>
    //                                                                                 <IonSelectOption value="315" class="all-option">315</IonSelectOption>
    //                                                                                 <IonSelectOption value="321" class="all-option">321</IonSelectOption>
    //                                                                                 <IonSelectOption value="323" class="all-option">323</IonSelectOption>
    //                                                                                 <IonSelectOption value="353" class="all-option">353</IonSelectOption>
    //                                                                                 <IonSelectOption value="359" class="all-option">359</IonSelectOption>
    //                                                                                 <IonSelectOption value="374" class="all-option">374</IonSelectOption>
    //                                                                                 <IonSelectOption value="424" class="all-option">424</IonSelectOption>
    //                                                                                 <IonSelectOption value="430" class="all-option">430</IonSelectOption>
    //                                                                                 <IonSelectOption value="432" class="all-option">432</IonSelectOption>
    //                                                                                 <IonSelectOption value="471" class="all-option">471</IonSelectOption>
    //                                                                                 <IonSelectOption value="475" class="all-option">475</IonSelectOption>
    //                                                                                 <IonSelectOption value="479" class="all-option">479</IonSelectOption>
    //                                                                                 <IonSelectOption value="480" class="all-option">480</IonSelectOption>
    //                                                                                 <IonSelectOption value="490" class="all-option">490</IonSelectOption>
    //                                                                                 <IonSelectOption value="499" class="all-option">499</IonSelectOption>
    //                                                                                 <IonSelectOption value="530" class="all-option">530</IonSelectOption>
    //                                                                                 <IonSelectOption value="532" class="all-option">532</IonSelectOption>
    //                                                                                 <IonSelectOption value="680" class="all-option">680</IonSelectOption>
    //                                                                               </>
    //                                                                               : postClassName === 'FREN' ?
    //                                                                                 <>
    //                                                                                   <IonSelectOption value="100" class="all-option">100</IonSelectOption>
    //                                                                                   <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                   <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                                                                   <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                                   <IonSelectOption value="207" class="all-option">207</IonSelectOption>
    //                                                                                   <IonSelectOption value="311" class="all-option">311</IonSelectOption>
    //                                                                                   <IonSelectOption value="370" class="all-option">370</IonSelectOption>
    //                                                                                   <IonSelectOption value="390" class="all-option">390</IonSelectOption>
    //                                                                                   <IonSelectOption value="420" class="all-option">420</IonSelectOption>
    //                                                                                 </>
    //                                                                                 : postClassName === 'GEOG' ?
    //                                                                                   <>
    //                                                                                     <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                     <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                                                                     <IonSelectOption value="300" class="all-option">300</IonSelectOption>
    //                                                                                     <IonSelectOption value="310" class="all-option">310</IonSelectOption>
    //                                                                                     <IonSelectOption value="311" class="all-option">311</IonSelectOption>
    //                                                                                     <IonSelectOption value="352" class="all-option">352</IonSelectOption>
    //                                                                                   </>
    //                                                                                   : postClassName === 'GSP' ?
    //                                                                                     <>
    //                                                                                       <IonSelectOption value="101" class="all-option">101</IonSelectOption>
    //                                                                                       <IonSelectOption value="216" class="all-option">216</IonSelectOption>
    //                                                                                       <IonSelectOption value="270" class="all-option">270</IonSelectOption>
    //                                                                                       <IonSelectOption value="316" class="all-option">316</IonSelectOption>
    //                                                                                       <IonSelectOption value="326" class="all-option">326</IonSelectOption>
    //                                                                                       <IonSelectOption value="370" class="all-option">370</IonSelectOption>
    //                                                                                       <IonSelectOption value="416" class="all-option">416</IonSelectOption>
    //                                                                                     </>
    //                                                                                     : postClassName === 'GERM' ?
    //                                                                                       <>
    //                                                                                         <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                         <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                                         <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                                                       </>
    //                                                                                       : postClassName === 'HED' ?
    //                                                                                         <>
    //                                                                                           <IonSelectOption value="100" class="all-option">100</IonSelectOption>
    //                                                                                           <IonSelectOption value="120" class="all-option">120</IonSelectOption>
    //                                                                                           <IonSelectOption value="231" class="all-option">231</IonSelectOption>
    //                                                                                           <IonSelectOption value="342" class="all-option">342</IonSelectOption>
    //                                                                                           <IonSelectOption value="345" class="all-option">345</IonSelectOption>
    //                                                                                           <IonSelectOption value="392" class="all-option">392</IonSelectOption>
    //                                                                                           <IonSelectOption value="446" class="all-option">446</IonSelectOption>
    //                                                                                           <IonSelectOption value="451" class="all-option">451</IonSelectOption>
    //                                                                                           <IonSelectOption value="495" class="all-option">495</IonSelectOption>
    //                                                                                         </>
    //                                                                                         : postClassName === 'HIST' ?
    //                                                                                           <>
    //                                                                                             <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                                                             <IonSelectOption value="106B" class="all-option">16B5</IonSelectOption>
    //                                                                                             <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                                                                             <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                                                                             <IonSelectOption value="111" class="all-option">111</IonSelectOption>
    //                                                                                             <IonSelectOption value="200" class="all-option">200</IonSelectOption>
    //                                                                                             <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                                                             <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                                                                             <IonSelectOption value="338" class="all-option">338</IonSelectOption>
    //                                                                                             <IonSelectOption value="342" class="all-option">342</IonSelectOption>
    //                                                                                             <IonSelectOption value="372" class="all-option">372</IonSelectOption>
    //                                                                                             <IonSelectOption value="397" class="all-option">397</IonSelectOption>
    //                                                                                             <IonSelectOption value="398" class="all-option">398</IonSelectOption>
    //                                                                                             <IonSelectOption value="420" class="all-option">420</IonSelectOption>
    //                                                                                             <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                                                                             <IonSelectOption value="491" class="all-option">491</IonSelectOption>
    //                                                                                           </>
    //                                                                                           : postClassName === 'JMC' ?
    //                                                                                             <>
    //                                                                                               <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                               <IonSelectOption value="120" class="all-option">120</IonSelectOption>
    //                                                                                               <IonSelectOption value="134" class="all-option">134</IonSelectOption>
    //                                                                                               <IonSelectOption value="154" class="all-option">154</IonSelectOption>
    //                                                                                               <IonSelectOption value="155" class="all-option">155</IonSelectOption>
    //                                                                                               <IonSelectOption value="156" class="all-option">156</IonSelectOption>
    //                                                                                               <IonSelectOption value="160" class="all-option">160</IonSelectOption>
    //                                                                                               <IonSelectOption value="302" class="all-option">302</IonSelectOption>
    //                                                                                               <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                                                               <IonSelectOption value="309" class="all-option">309</IonSelectOption>
    //                                                                                               <IonSelectOption value="318" class="all-option">318</IonSelectOption>
    //                                                                                               <IonSelectOption value="323" class="all-option">323</IonSelectOption>
    //                                                                                               <IonSelectOption value="325" class="all-option">325</IonSelectOption>
    //                                                                                               <IonSelectOption value="327" class="all-option">327</IonSelectOption>
    //                                                                                               <IonSelectOption value="355" class="all-option">355</IonSelectOption>
    //                                                                                               <IonSelectOption value="360" class="all-option">360</IonSelectOption>
    //                                                                                               <IonSelectOption value="427" class="all-option">427</IonSelectOption>
    //                                                                                               <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                                                                             </>
    //                                                                                             : postClassName === 'KINS' ?
    //                                                                                               <>
    //                                                                                                 <IonSelectOption value="165" class="all-option">165</IonSelectOption>
    //                                                                                                 <IonSelectOption value="244" class="all-option">244</IonSelectOption>
    //                                                                                                 <IonSelectOption value="288" class="all-option">288</IonSelectOption>
    //                                                                                                 <IonSelectOption value="315" class="all-option">315</IonSelectOption>
    //                                                                                                 <IonSelectOption value="339" class="all-option">339</IonSelectOption>
    //                                                                                                 <IonSelectOption value="379" class="all-option">379</IonSelectOption>
    //                                                                                                 <IonSelectOption value="384" class="all-option">384</IonSelectOption>
    //                                                                                                 <IonSelectOption value="385" class="all-option">385</IonSelectOption>
    //                                                                                                 <IonSelectOption value="386" class="all-option">386</IonSelectOption>
    //                                                                                                 <IonSelectOption value="425" class="all-option">425</IonSelectOption>
    //                                                                                                 <IonSelectOption value="456A" class="all-option">456A</IonSelectOption>
    //                                                                                                 <IonSelectOption value="460" class="all-option">460</IonSelectOption>
    //                                                                                                 <IonSelectOption value="474" class="all-option">474</IonSelectOption>
    //                                                                                                 <IonSelectOption value="482" class="all-option">482</IonSelectOption>
    //                                                                                               </>
    //                                                                                               : postClassName === 'MATH' ?
    //                                                                                                 <>
    //                                                                                                   <IonSelectOption value="101" class="all-option">101</IonSelectOption>
    //                                                                                                   <IonSelectOption value="101I" class="all-option">101I</IonSelectOption>
    //                                                                                                   <IonSelectOption value="101T" class="all-option">101T</IonSelectOption>
    //                                                                                                   <IonSelectOption value="102" class="all-option">102</IonSelectOption>
    //                                                                                                   <IonSelectOption value="103" class="all-option">103</IonSelectOption>
    //                                                                                                   <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                                   <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                                                   <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                                                                                   <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                                                                                   <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                                                                   <IonSelectOption value="245" class="all-option">245</IonSelectOption>
    //                                                                                                   <IonSelectOption value="253" class="all-option">253</IonSelectOption>
    //                                                                                                   <IonSelectOption value="311" class="all-option">311</IonSelectOption>
    //                                                                                                   <IonSelectOption value="315" class="all-option">315</IonSelectOption>
    //                                                                                                   <IonSelectOption value="381" class="all-option">381</IonSelectOption>
    //                                                                                                   <IonSelectOption value="460" class="all-option">460</IonSelectOption>
    //                                                                                                 </>
    //                                                                                                 : postClassName === 'MUS' ?
    //                                                                                                   <>
    //                                                                                                     <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106B" class="all-option">106B</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106E" class="all-option">106E</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106F" class="all-option">106F</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106H" class="all-option">106H</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106J" class="all-option">106J</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106K" class="all-option">106K</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106N" class="all-option">106N</IonSelectOption>
    //                                                                                                     <IonSelectOption value="106O" class="all-option">106O</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107C" class="all-option">107C</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107F" class="all-option">107F</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107G" class="all-option">107G</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107I" class="all-option">107I</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107J" class="all-option">107J</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107P" class="all-option">107P</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107Q" class="all-option">107Q</IonSelectOption>
    //                                                                                                     <IonSelectOption value="107T" class="all-option">107T</IonSelectOption>
    //                                                                                                     <IonSelectOption value="108G" class="all-option">108G</IonSelectOption>
    //                                                                                                     <IonSelectOption value="108K" class="all-option">108K</IonSelectOption>
    //                                                                                                     <IonSelectOption value="108P" class="all-option">108P</IonSelectOption>
    //                                                                                                     <IonSelectOption value="108T" class="all-option">108T</IonSelectOption>
    //                                                                                                     <IonSelectOption value="108V" class="all-option">108V</IonSelectOption>
    //                                                                                                     <IonSelectOption value="108G" class="all-option">108G</IonSelectOption>
    //                                                                                                     <IonSelectOption value="109G" class="all-option">109G</IonSelectOption>
    //                                                                                                     <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                                                                                     <IonSelectOption value="112" class="all-option">112</IonSelectOption>
    //                                                                                                     <IonSelectOption value="130" class="all-option">130</IonSelectOption>
    //                                                                                                     <IonSelectOption value="180" class="all-option">180</IonSelectOption>
    //                                                                                                     <IonSelectOption value="215" class="all-option">215</IonSelectOption>
    //                                                                                                     <IonSelectOption value="217" class="all-option">217</IonSelectOption>
    //                                                                                                     <IonSelectOption value="220" class="all-option">220</IonSelectOption>
    //                                                                                                     <IonSelectOption value="221" class="all-option">221</IonSelectOption>
    //                                                                                                     <IonSelectOption value="222" class="all-option">222</IonSelectOption>
    //                                                                                                     <IonSelectOption value="223" class="all-option">223</IonSelectOption>
    //                                                                                                     <IonSelectOption value="224" class="all-option">224</IonSelectOption>
    //                                                                                                     <IonSelectOption value="225" class="all-option">225</IonSelectOption>
    //                                                                                                     <IonSelectOption value="226" class="all-option">226</IonSelectOption>
    //                                                                                                     <IonSelectOption value="227" class="all-option">227</IonSelectOption>
    //                                                                                                     <IonSelectOption value="228" class="all-option">228</IonSelectOption>
    //                                                                                                     <IonSelectOption value="229" class="all-option">229</IonSelectOption>
    //                                                                                                     <IonSelectOption value="230" class="all-option">230</IonSelectOption>
    //                                                                                                     <IonSelectOption value="231" class="all-option">231</IonSelectOption>
    //                                                                                                     <IonSelectOption value="232" class="all-option">232</IonSelectOption>
    //                                                                                                     <IonSelectOption value="233" class="all-option">233</IonSelectOption>
    //                                                                                                     <IonSelectOption value="234" class="all-option">234</IonSelectOption>
    //                                                                                                     <IonSelectOption value="235" class="all-option">235</IonSelectOption>
    //                                                                                                     <IonSelectOption value="236" class="all-option">236</IonSelectOption>
    //                                                                                                     <IonSelectOption value="237" class="all-option">237</IonSelectOption>
    //                                                                                                     <IonSelectOption value="238" class="all-option">238</IonSelectOption>
    //                                                                                                     <IonSelectOption value="301" class="all-option">301</IonSelectOption>
    //                                                                                                     <IonSelectOption value="302" class="all-option">302</IonSelectOption>
    //                                                                                                     <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                                                                                     <IonSelectOption value="314" class="all-option">314</IonSelectOption>
    //                                                                                                     <IonSelectOption value="316" class="all-option">316</IonSelectOption>
    //                                                                                                     <IonSelectOption value="319" class="all-option">319</IonSelectOption>
    //                                                                                                     <IonSelectOption value="324" class="all-option">324</IonSelectOption>
    //                                                                                                     <IonSelectOption value="330" class="all-option">330</IonSelectOption>
    //                                                                                                     <IonSelectOption value="334" class="all-option">334</IonSelectOption>
    //                                                                                                     <IonSelectOption value="338" class="all-option">338</IonSelectOption>
    //                                                                                                     <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                                                                                                     <IonSelectOption value="348" class="all-option">348</IonSelectOption>
    //                                                                                                     <IonSelectOption value="353" class="all-option">353</IonSelectOption>
    //                                                                                                     <IonSelectOption value="361" class="all-option">361</IonSelectOption>
    //                                                                                                   </>
    //                                                                                                   : postClassName === 'NAS' ?
    //                                                                                                     <>
    //                                                                                                       <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                                                                       <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                                                       <IonSelectOption value="200" class="all-option">200</IonSelectOption>
    //                                                                                                       <IonSelectOption value="302" class="all-option">302</IonSelectOption>
    //                                                                                                       <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                                                                       <IonSelectOption value="307" class="all-option">307</IonSelectOption>
    //                                                                                                       <IonSelectOption value="331" class="all-option">331</IonSelectOption>
    //                                                                                                       <IonSelectOption value="332" class="all-option">332</IonSelectOption>
    //                                                                                                       <IonSelectOption value="333" class="all-option">333</IonSelectOption>
    //                                                                                                       <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                                                                                                       <IonSelectOption value="364" class="all-option">364</IonSelectOption>
    //                                                                                                     </>
    //                                                                                                     : postClassName === 'OCN' ?
    //                                                                                                       <>
    //                                                                                                         <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                                                                                         <IonSelectOption value="260" class="all-option">260</IonSelectOption>
    //                                                                                                         <IonSelectOption value="301" class="all-option">301</IonSelectOption>
    //                                                                                                         <IonSelectOption value="310" class="all-option">310</IonSelectOption>
    //                                                                                                         <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                                                                                                         <IonSelectOption value="370" class="all-option">370</IonSelectOption>
    //                                                                                                         <IonSelectOption value="496" class="all-option">496</IonSelectOption>
    //                                                                                                       </>
    //                                                                                                       : postClassName === 'PHIL' ?
    //                                                                                                         <>
    //                                                                                                           <IonSelectOption value="100" class="all-option">100</IonSelectOption>
    //                                                                                                           <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                                                                           <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                                                                                           <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                                                           <IonSelectOption value="198" class="all-option">198</IonSelectOption>
    //                                                                                                           <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                                                                           <IonSelectOption value="302" class="all-option">302</IonSelectOption>
    //                                                                                                           <IonSelectOption value="304" class="all-option">304</IonSelectOption>
    //                                                                                                           <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                                                                           <IonSelectOption value="307" class="all-option">307</IonSelectOption>
    //                                                                                                           <IonSelectOption value="371" class="all-option">371</IonSelectOption>
    //                                                                                                           <IonSelectOption value="420" class="all-option">420</IonSelectOption>
    //                                                                                                           <IonSelectOption value="480" class="all-option">480</IonSelectOption>
    //                                                                                                         </>
    //                                                                                                         : postClassName === 'PSCI' ?
    //                                                                                                           <>
    //                                                                                                             <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                                                                                             <IonSelectOption value="159" class="all-option">159</IonSelectOption>
    //                                                                                                             <IonSelectOption value="220" class="all-option">220</IonSelectOption>
    //                                                                                                             <IonSelectOption value="235" class="all-option">235</IonSelectOption>
    //                                                                                                             <IonSelectOption value="240" class="all-option">240</IonSelectOption>
    //                                                                                                             <IonSelectOption value="280" class="all-option">280</IonSelectOption>
    //                                                                                                             <IonSelectOption value="295" class="all-option">295</IonSelectOption>
    //                                                                                                             <IonSelectOption value="303" class="all-option">303</IonSelectOption>
    //                                                                                                             <IonSelectOption value="305" class="all-option">305</IonSelectOption>
    //                                                                                                             <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                                                                             <IonSelectOption value="317" class="all-option">317</IonSelectOption>
    //                                                                                                             <IonSelectOption value="354" class="all-option">354</IonSelectOption>
    //                                                                                                             <IonSelectOption value="360" class="all-option">360</IonSelectOption>
    //                                                                                                             <IonSelectOption value="373" class="all-option">373</IonSelectOption>
    //                                                                                                             <IonSelectOption value="381S" class="all-option">381S</IonSelectOption>
    //                                                                                                             <IonSelectOption value="412" class="all-option">413</IonSelectOption>
    //                                                                                                             <IonSelectOption value="485" class="all-option">485</IonSelectOption>
    //                                                                                                           </>
    //                                                                                                           : postClassName === 'PSYC' ?
    //                                                                                                             <>
    //                                                                                                               <IonSelectOption value="100" class="all-option">100</IonSelectOption>
    //                                                                                                               <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                                                                               <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                                                                                               <IonSelectOption value="198" class="all-option">198</IonSelectOption>
    //                                                                                                               <IonSelectOption value="240" class="all-option">240</IonSelectOption>
    //                                                                                                               <IonSelectOption value="300" class="all-option">300</IonSelectOption>
    //                                                                                                               <IonSelectOption value="302" class="all-option">302</IonSelectOption>
    //                                                                                                               <IonSelectOption value="303" class="all-option">303</IonSelectOption>
    //                                                                                                               <IonSelectOption value="306" class="all-option">306</IonSelectOption>
    //                                                                                                               <IonSelectOption value="311" class="all-option">311</IonSelectOption>
    //                                                                                                               <IonSelectOption value="321" class="all-option">321</IonSelectOption>
    //                                                                                                               <IonSelectOption value="322" class="all-option">322</IonSelectOption>
    //                                                                                                               <IonSelectOption value="323" class="all-option">323</IonSelectOption>
    //                                                                                                               <IonSelectOption value="324" class="all-option">324</IonSelectOption>
    //                                                                                                               <IonSelectOption value="335" class="all-option">335</IonSelectOption>
    //                                                                                                               <IonSelectOption value="336" class="all-option">336</IonSelectOption>
    //                                                                                                               <IonSelectOption value="337" class="all-option">337</IonSelectOption>
    //                                                                                                               <IonSelectOption value="338" class="all-option">338</IonSelectOption>
    //                                                                                                               <IonSelectOption value="345" class="all-option">345</IonSelectOption>
    //                                                                                                               <IonSelectOption value="411" class="all-option">411</IonSelectOption>
    //                                                                                                               <IonSelectOption value="414" class="all-option">414</IonSelectOption>
    //                                                                                                               <IonSelectOption value="415" class="all-option">415</IonSelectOption>
    //                                                                                                               <IonSelectOption value="419" class="all-option">419</IonSelectOption>
    //                                                                                                               <IonSelectOption value="436" class="all-option">436</IonSelectOption>
    //                                                                                                               <IonSelectOption value="454" class="all-option">454</IonSelectOption>
    //                                                                                                               <IonSelectOption value="473" class="all-option">473</IonSelectOption>
    //                                                                                                               <IonSelectOption value="486" class="all-option">486</IonSelectOption>
    //                                                                                                               <IonSelectOption value="489S" class="all-option">489S</IonSelectOption>
    //                                                                                                               <IonSelectOption value="490" class="all-option">490</IonSelectOption>
    //                                                                                                               <IonSelectOption value="495" class="all-option">495</IonSelectOption>
    //                                                                                                               <IonSelectOption value="497" class="all-option">497</IonSelectOption>
    //                                                                                                               <IonSelectOption value="499" class="all-option">499</IonSelectOption>
    //                                                                                                               <IonSelectOption value="511" class="all-option">511</IonSelectOption>
    //                                                                                                               <IonSelectOption value="605" class="all-option">605</IonSelectOption>
    //                                                                                                               <IonSelectOption value="607" class="all-option">607</IonSelectOption>
    //                                                                                                               <IonSelectOption value="616" class="all-option">616</IonSelectOption>
    //                                                                                                               <IonSelectOption value="622" class="all-option">622</IonSelectOption>
    //                                                                                                               <IonSelectOption value="632" class="all-option">632</IonSelectOption>
    //                                                                                                               <IonSelectOption value="641" class="all-option">641</IonSelectOption>
    //                                                                                                               <IonSelectOption value="647" class="all-option">647</IonSelectOption>
    //                                                                                                               <IonSelectOption value="652" class="all-option">652</IonSelectOption>
    //                                                                                                               <IonSelectOption value="653" class="all-option">653</IonSelectOption>
    //                                                                                                               <IonSelectOption value="654" class="all-option">654</IonSelectOption>
    //                                                                                                               <IonSelectOption value="657" class="all-option">657</IonSelectOption>
    //                                                                                                               <IonSelectOption value="658" class="all-option">658</IonSelectOption>
    //                                                                                                               <IonSelectOption value="659" class="all-option">659</IonSelectOption>
    //                                                                                                               <IonSelectOption value="662" class="all-option">662</IonSelectOption>
    //                                                                                                               <IonSelectOption value="673" class="all-option">673</IonSelectOption>
    //                                                                                                               <IonSelectOption value="676" class="all-option">676</IonSelectOption>
    //                                                                                                               <IonSelectOption value="680" class="all-option">680</IonSelectOption>
    //                                                                                                               <IonSelectOption value="690" class="all-option">690</IonSelectOption>
    //                                                                                                             </>
    //                                                                                                             : postClassName === 'RS' ?
    //                                                                                                               <>
    //                                                                                                                 <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                                                 <IonSelectOption value="120" class="all-option">120</IonSelectOption>
    //                                                                                                                 <IonSelectOption value="300" class="all-option">300</IonSelectOption>
    //                                                                                                                 <IonSelectOption value="332" class="all-option">332</IonSelectOption>
    //                                                                                                                 <IonSelectOption value="393" class="all-option">393</IonSelectOption>
    //                                                                                                                 <IonSelectOption value="394" class="all-option">394</IonSelectOption>
    //                                                                                                               </>
    //                                                                                                               : postClassName === 'SPAN' ?
    //                                                                                                                 <>
    //                                                                                                                   <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="108" class="all-option">108</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="207" class="all-option">207</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="308" class="all-option">308</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="313" class="all-option">313</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="343" class="all-option">343</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="345" class="all-option">345</IonSelectOption>
    //                                                                                                                   <IonSelectOption value="370" class="all-option">370</IonSelectOption>
    //                                                                                                                 </>
    //                                                                                                                 : postClassName === 'STAT' ?
    //                                                                                                                   <>
    //                                                                                                                     <IonSelectOption value="108" class="all-option">108</IonSelectOption>
    //                                                                                                                     <IonSelectOption value="109" class="all-option">109</IonSelectOption>
    //                                                                                                                     <IonSelectOption value="323" class="all-option">323</IonSelectOption>
    //                                                                                                                     <IonSelectOption value="333" class="all-option">333</IonSelectOption>
    //                                                                                                                     <IonSelectOption value="410" class="all-option">410</IonSelectOption>
    //                                                                                                                     <IonSelectOption value="510" class="all-option">510</IonSelectOption>
    //                                                                                                                   </>
    //                                                                                                                   : postClassName === 'TA' ?
    //                                                                                                                     <>
    //                                                                                                                       <IonSelectOption value="104" class="all-option">104</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="105" class="all-option">105</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="106" class="all-option">106</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="107" class="all-option">107</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="231" class="all-option">231</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="237" class="all-option">237</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="328" class="all-option">328</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="336" class="all-option">336</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="340" class="all-option">340</IonSelectOption>
    //                                                                                                                       <IonSelectOption value="494" class="all-option">494</IonSelectOption>
    //                                                                                                                     </>
    //                                                                                                                     : postClassName === 'WLDF' ?
    //                                                                                                                       <>
    //                                                                                                                         <IonSelectOption value="111" class="all-option">111</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="210" class="all-option">210</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="244" class="all-option">244</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="301" class="all-option">301</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="311" class="all-option">311</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="365" class="all-option">365</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="422" class="all-option">422</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="423" class="all-option">423</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="430" class="all-option">430</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="460" class="all-option">460</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="468" class="all-option">468</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="475" class="all-option">475</IonSelectOption>
    //                                                                                                                         <IonSelectOption value="478" class="all-option">478</IonSelectOption>
    //                                                                                                                       </>
    //                                                                                                                       : postClassName === 'ZOOL' ?
    //                                                                                                                         <>
    //                                                                                                                           <IonSelectOption value="110" class="all-option">110</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="113" class="all-option">113</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="198" class="all-option">198</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="270" class="all-option">270</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="310" class="all-option">310</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="314" class="all-option">314</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="356" class="all-option">356</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="358" class="all-option">358</IonSelectOption>
    //                                                                                                                           <IonSelectOption value="370" class="all-option">370</IonSelectOption>
    //                                                                                                                         </>
    //                                                                                                                         : null

    //                             }
    //                           </>
    //                         </IonSelect>
    //                       </IonItem>
    //                     }
    //                   </IonFab>
    //                 }
    //                 <IonFab horizontal="end" style={{
    //                   textAlign: "center", alignItems: "center",
    //                   alignSelf: "center", display: "flex", paddingTop: ""
    //                 }}>
    //                   <IonButton onClick={takePicture} mode="ios" color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} fill='clear' disabled={prevPostUploading}>
    //                     <IonIcon icon={cameraOutline} />
    //                   </IonButton>
    //                   <IonButton
    //                     color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
    //                     onClick={() => {
    //                       handlePostOptions();
    //                     }}
    //                     mode="ios"
    //                     shape="round"
    //                     fill="clear"
    //                     id="message"
    //                     disabled={prevPostUploading}
    //                   >
    //                     Post
    //                   </IonButton>
    //                 </IonFab>
    //               </IonRow>
    //               {photo && photo.length > 0 ? (
    //                 <>
    //                   <FadeIn>
    //                     {photo.map((photo, index) => {
    //                       return (
    //                         <IonCard key={"photo_" + index.toString()}>
    //                           <IonImg src={photo?.webPath} />
    //                         </IonCard>
    //                       )
    //                     })}
    //                   </FadeIn>
    //                 </>
    //               ) : <> <br></br><br></br> </>}

    //             {/* </div> */}
    //           </IonCard>
    //           {prevPostUploading &&
    //             <p style={{ textAlign: "center" }}>Wait until previous post has <br />uploaded to post again</p>}
    //         </IonContent>
    //       </IonModal>

    //       <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{}}>
    //         <IonFabButton
    //           color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
    //           onClick={() => {
    //             setShowModal(true);
    //           }}
    //         >
    //           <IonIcon icon={add} />
    //         </IonFabButton>
    //       </IonFab>

    //       {/* <br /> <br /> */}
    //       {posts && posts.length > 0 ? (
    //         posts?.map((post, index) => (
    //           <FadeIn key={post.key}>
    //             <IonList inset={true} mode="ios">
    //               <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate("post/" + post.key, 'forward'); }}>
    //                 <IonLabel class="ion-text-wrap">
    //                   <IonText color="medium">
    //                     <FadeIn>
    //                       <IonAvatar
    //                         onClick={(e) => {
    //                           e.stopPropagation();
    //                           handleUserPageNavigation(post.uid);
    //                         }}
    //                         class="posts-avatar"
    //                       >
    //                         <ProfilePhoto uid={post.uid}></ProfilePhoto>
    //                       </IonAvatar>
    //                     </FadeIn>
    //                     <p>
    //                       {post.userName}
    //                     </p>
    //                   </IonText>
    //                   {post.postType ? (
    //                     <IonFab vertical="top" horizontal="end" onClick={(e) => {
    //                       if(post.postType !== "general") {
    //                         e.stopPropagation();
    //                         dynamicNavigate("type/" + post.postType, 'forward');
    //                       }
    //                     }}>
    //                       {post.postType !== "general" ?
    //                         <p
    //                           style={{
    //                             fontWeight: "bold",
    //                             color: getColor(post.postType),
    //                           }}
    //                         >
    //                           {post.postType.toUpperCase()}
    //                           &nbsp;
    //                           {post.marker ? (
    //                             <RoomIcon
    //                               style={{ fontSize: "1em" }}
    //                               onClick={(e) => {
    //                                 e.stopPropagation();
    //                                 localStorage.setItem("lat", (post.location[0].toString()));
    //                                 localStorage.setItem("long", (post.location[1].toString()));
    //                                 dynamicNavigate("maps", 'forward');
    //                               }}
    //                             />
    //                           ) : null}
    //                         </p>
    //                         :
    //                         <p
    //                           style={{
    //                             fontWeight: "bold",
    //                             color: getColor(post.postType),
    //                             marginLeft: "75%"
    //                           }}
    //                         >
    //                           {post.marker ? (
    //                             <RoomIcon onClick={(e) => {
    //                               e.stopPropagation();
    //                               localStorage.setItem("lat", (post.location[0].toString()));
    //                               localStorage.setItem("long", (post.location[1].toString()));
    //                               dynamicNavigate("maps", 'forward');
    //                             }}
    //                               style={{ fontSize: "1em" }} />) : null}
    //                         </p>
    //                       }
    //                       <IonNote style={{ fontSize: "0.85em" }}>
    //                         {getDate(post.timestamp)}
    //                       </IonNote>
    //                     </IonFab>
    //                   ) :
    //                     (
    //                       <IonFab vertical="top" horizontal="end">
    //                         <IonNote style={{ fontSize: "0.85em" }}>
    //                           {getDate(post.timestamp)}
    //                         </IonNote>
    //                       </IonFab>
    //                     )}
    //                   <div style={{ height: "0.75vh", }}>{" "}</div>
    //                   {"className" in post && "classNumber" in post && post.className.length > 0 ?
    //                     <Linkify style={ sensitiveToggled && "reports" in post && post.reports > 1 ? {filter: "blur(0.25em)"} : {}}  tagName="h3" className="h2-message">
    //                       {post.message}
    //                       <IonNote
    //                         onClick={(e) => {
    //                           e.stopPropagation();
    //                           dynamicNavigate("class/" + post.className, 'forward');
    //                         }}
    //                         color="medium"
    //                         style={{ fontWeight: "400" }}
    //                       >
    //                         &nbsp; — {post.className}{post.classNumber}
    //                       </IonNote>
    //                     </Linkify>
    //                     :
    //                     <Linkify style={ sensitiveToggled && "reports" in post && post.reports > 1 ? {filter: "blur(0.25em)"} : {}}  tagName="h3" className="h2-message">
    //                       {post.message}
    //                     </Linkify>
    //                   }

    //                   {"imgSrc" in post && post.imgSrc &&
    //                     post.imgSrc.length == 1 &&
    //                     <>
    //                       <div style={{ height: "0.75vh" }}>{" "}</div>
    //                       <div
    //                         className="ion-img-container"
    //                         style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px'}}
    //                         onClick={(e) => {
    //                           e.stopPropagation();
    //                           const img: CapacitorImage = {
    //                             url: post.imgSrc[0],
    //                             title: `${post.userName}'s post`
    //                           };
    //                           CapacitorPhotoViewer.show({
    //                             images: [img],
    //                             mode: 'one',
    //                             options: {
    //                               title: true
    //                             }
    //                           }).catch((err) => {
    //                             Toast.error('Unable to open image on web version');
    //                           });
    //                         }}
    //                       >
    //                       </div>
    //                     </>
    //                   }
    //                   {"imgSrc" in post && post.imgSrc &&
    //                     post.imgSrc.length == 2 ? (
    //                     <>
    //                       <div style={{ height: "0.75vh" }}>{" "}</div>
    //                       <IonRow>
    //                         <IonCol>
    //                           <div
    //                             className="ion-img-container"
    //                             style={sensitiveToggled &&  "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px'}}
    //                             onClick={(e) => {
    //                               e.stopPropagation();
    //                               const img: CapacitorImage[] = [
    //                                 {
    //                                   url: post.imgSrc[0],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                                 {
    //                                   url: post.imgSrc[1],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                               ]
    //                               CapacitorPhotoViewer.show({
    //                                 images: img,
    //                                 mode: 'slider',
    //                                 options: {
    //                                   title: true,
    //                                 },
    //                                 startFrom: 0,
    //                               }).catch((err) => {
    //                                 Toast.error('Unable to open image on web version');
    //                               });
    //                             }}
    //                           >
    //                           </div>
    //                         </IonCol>
    //                         <IonCol>
    //                           <div
    //                             className="ion-img-container"
    //                             style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px'}}
    //                             onClick={(e) => {
    //                               e.stopPropagation();
    //                               const img: CapacitorImage[] = [
    //                                 {
    //                                   url: post.imgSrc[0],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                                 {
    //                                   url: post.imgSrc[1],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                               ]
    //                               CapacitorPhotoViewer.show({
    //                                 images: img,
    //                                 mode: 'slider',
    //                                 options: {
    //                                   title: true
    //                                 },
    //                                 startFrom: 1,
    //                               }).catch((err) => {
    //                                 Toast.error('Unable to open image on web version');
    //                               });
    //                             }}
    //                           >
    //                           </div>
    //                         </IonCol>
    //                       </IonRow>
    //                     </>
    //                   ) : null}
    //                   {"imgSrc" in post && post.imgSrc &&
    //                     post.imgSrc.length >= 3 ? (
    //                     <>
    //                       <div style={{ height: "0.75vh",}}>{" "}</div>
    //                       <IonRow>
    //                         <IonCol>
    //                           <div
    //                             className="ion-img-container"
    //                             style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px'}}
    //                             onClick={(e) => {
    //                               e.stopPropagation();
    //                               const img: CapacitorImage[] = [
    //                                 {
    //                                   url: post.imgSrc[0],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                                 {
    //                                   url: post.imgSrc[1],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                                 {
    //                                   url: post.imgSrc[2],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                               ]
    //                               CapacitorPhotoViewer.show({
    //                                 images: img,
    //                                 mode: 'slider',
    //                                 options: {
    //                                   title: true
    //                                 },
    //                                 startFrom: 0,
    //                               }).catch((err) => {
    //                                 Toast.error('Unable to open image on web version');
    //                               });
    //                             }}
    //                           >
    //                           </div>
    //                         </IonCol>
    //                         <IonCol>
    //                           <div
    //                             className="ion-img-container"
    //                             style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px', filter: "blur(0.25em)"} : { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px'}}
    //                             onClick={(e) => {
    //                               e.stopPropagation();
    //                               const img: CapacitorImage[] = [
    //                                 {
    //                                   url: post.imgSrc[0],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                                 {
    //                                   url: post.imgSrc[1],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                                 {
    //                                   url: post.imgSrc[2],
    //                                   title: `${post.userName}'s post`
    //                                 },
    //                               ]
    //                               CapacitorPhotoViewer.show({
    //                                 images: img,
    //                                 mode: 'slider',
    //                                 options: {
    //                                   title: true
    //                                 },
    //                                 startFrom: 1,
    //                               }).catch((err) => {
    //                                 Toast.error('Unable to open image on web version');
    //                               });
    //                             }}
    //                           >
    //                           </div>
    //                         </IonCol>
    //                       </IonRow>
    //                       <>
    //                         <div style={{ height: "0.75vh", }}>{" "}</div>
    //                         <div
    //                           className="ion-img-container"
    //                           style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '20px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '20px'}}
    //                           onClick={(e) => {
    //                             e.stopPropagation();
    //                             const img: CapacitorImage[] = [
    //                               {
    //                                 url: post.imgSrc[0],
    //                                 title: `${post.userName}'s post`
    //                               },
    //                               {
    //                                 url: post.imgSrc[1],
    //                                 title: `${post.userName}'s post`
    //                               },
    //                               {
    //                                 url: post.imgSrc[2],
    //                                 title: `${post.userName}'s post`
    //                               },
    //                             ]
    //                             CapacitorPhotoViewer.show({
    //                               images: img,
    //                               mode: 'slider',
    //                               options: {
    //                                 title: true
    //                               },
    //                               startFrom: 2,
    //                             }).catch((err) => {
    //                               Toast.error('Unable to open image on web version');
    //                             });
    //                           }}
    //                         >
    //                         </div>
    //                       </>
    //                     </>
    //                   ) : null}
    //                 </IonLabel>
    //               </IonItem>
    //               <IonItem lines="none" mode="ios">
    //                 <IonButton
    //                   onAnimationEnd={() => {
    //                     setLikeAnimation(-1);
    //                   }}
    //                   className={
    //                     likeAnimation === post.key ? "likeAnimation" : ""
    //                   }
    //                   disabled={disabledLikeButtons === index || Object.keys(post.likes).length - 1 === -1}
    //                   mode="ios"
    //                   fill="outline"
    //                   color={
    //                     user &&
    //                       post.likes[user.uid] !== undefined && schoolName !== "Cal Poly Humboldt"
    //                       ? "primary"
    //                       : user && post.likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && schoolColorToggled
    //                         ? "tertiary"
    //                         : user && post.likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && !schoolColorToggled
    //                           ? "primary"
    //                           : "medium"
    //                   }
    //                   onClick={() => {
    //                     setLikeAnimation(post.key);
    //                     setDisabledLikeButtons(index);
    //                     handleUpVote(post.key, index, post);
    //                   }}
    //                 >
    //                   <KeyboardArrowUpIcon />
    //                   <p>{Object.keys(post.likes).length - 1} </p>
    //                 </IonButton>
    //                 <p>&nbsp;</p>
    //                 <IonButton
    //                   mode="ios"
    //                   color="medium"
    //                   onClick={() => {
    //                     dynamicNavigate("post/" + post.key, 'forward');
    //                     // history.push("/userPost/" + post.key);
    //                   }}
    //                 >
    //                   <ForumIcon />
    //                   <p>&nbsp; {post.commentAmount} </p>
    //                 </IonButton>
    //                 <IonButton
    //                   onAnimationEnd={() => {
    //                     setDislikeAnimation(-1);
    //                   }}
    //                   className={
    //                     dislikeAnimation === post.key ? "likeAnimation" : ""
    //                   }
    //                   disabled={disabledLikeButtons === index || Object.keys(post.dislikes).length - 1 === -1}
    //                   mode="ios"
    //                   fill="outline"
    //                   color={
    //                     index != -1 &&
    //                       posts &&
    //                       posts[index] &&
    //                       "dislikes" in posts[index] &&
    //                       user &&
    //                       posts[index].dislikes[user.uid] !== undefined
    //                       ? "danger"
    //                       : "medium"
    //                   }
    //                   onClick={() => {
    //                     setDislikeAnimation(post.key);
    //                     setDisabledLikeButtons(index);
    //                     handleDownVote(post.key, index, post);
    //                   }}
    //                 >
    //                   <KeyboardArrowDownIcon />
    //                   <p>{Object.keys(post.dislikes).length - 1} </p>
    //                 </IonButton>
    //                 {"reports" in post && post.reports > 1 &&
    //                   <IonFab horizontal="end">
    //                     <IonIcon icon={warningSharp} color="warning" onClick={() => {
    //                       Dialog.alert({
    //                         title: "Flagged Post",
    //                         message: 'Post has been reported as sensitive/objectionable'
    //                       })
    //                     }}></IonIcon>
    //                   </IonFab>
    //                 }
    //                 {/* <IonButton color="medium" slot="end" onClick={() => { sharePost(post); }}>
    //                   <IonIcon icon={shareOutline} />
    //                 </IonButton> */}
    //                 {/* <IonNote>&nbsp;&nbsp;&nbsp;&nbsp;
    //                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    //                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    //                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{post.className}{post.classNumber}</IonNote> */}
    //               </IonItem>
    //             </IonList>
    //           </FadeIn>
    //         ))
    //       ) : (
    //         <div className="h3-error">
    //           <IonNote >
    //             Unable to load posts, swipe down from top to reload
    //           </IonNote>
    //           <div className="h3-error">
    //             <SignalWifiOff
    //               fontSize="large"
    //               style={{ fontSize: "4.10vh" }}
    //             />
    //           </div>
    //         </div>
    //       )}
    //       <br></br><br></br><br></br>
    //       <IonInfiniteScroll
    //         onIonInfinite={(e: any) => { handleLoadPostsNextBatch(e) }}
    //         disabled={(lastKey.length == 0)}
    //       >
    //         <IonInfiniteScrollContent
    //           loadingSpinner="crescent"
    //           loadingText="Loading"
    //         ></IonInfiniteScrollContent>
    //       </IonInfiniteScroll>
    //     </IonContent>
    //     {
    //       showProgressBar &&
    //       <FadeIn>
    //         {/* <div slot="fixed" style={{ width: "100%" }}> */}
    //         <IonFooter mode='ios' >
    //           {/* <IonToolbar mode="ios" translucen> */}
    //           {/* <ProgressBar percentage={progressPercentage} /> */}
    //           <IonProgressBar type="indeterminate"></IonProgressBar>
    //           {/* </IonToolbar> */}
    //         </IonFooter>
    //         {/* </div> */}
    //       </FadeIn>
    //     }
    //   </IonPage >
    // );
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