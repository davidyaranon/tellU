import "../App.css";
import "../theme/variables.css";

import {
  IonAvatar, IonButton, IonButtons, IonCard, IonCheckbox, IonCol,
  IonContent, IonFab, IonFabButton, IonFooter, IonHeader, IonIcon,
  IonImg, IonItem, IonLabel, IonList,IonLoading, IonModal, IonNote, 
  IonPage, IonProgressBar, IonRefresher, IonRefresherContent,
  IonRow, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar,
} from "@ionic/react";
import { Camera, GalleryPhoto } from "@capacitor/camera";
import { Geolocation, GeolocationOptions, Geoposition } from "@awesome-cordova-plugins/geolocation";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import TellUHeader, { ionHeaderStyle } from "./Header";
import { RefresherEventDetail } from "@ionic/core";
import { add, cameraOutline, refreshCircleOutline } from "ionicons/icons";
import { addMessage, downVote, getAllPosts, promiseTimeout, upVote } from "../fbconfig";
import auth, { getAllPostsNextBatch, getLikes, storage } from "../fbconfig";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getColor, timeout } from '../shared/functions';
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import FadeIn from "react-fade-in";
import { Keyboard } from "@capacitor/keyboard";
import Linkify from 'linkify-react';
import Map from "@mui/icons-material/Map";
import ProfilePhoto from "./ProfilePhoto";
import RoomIcon from '@mui/icons-material/Room';
import TimeAgo from "javascript-time-ago";
import { useTabsContext } from "../my-context";
import { db } from '../fbconfig';
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import en from "javascript-time-ago/locale/en.json";
import { uploadBytes } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { useToast } from "@agney/ir-toast";
import { v4 as uuidv4 } from "uuid";
import { Virtuoso } from 'react-virtuoso';
import PostImages from "./PostImages";
import { ClassSelections } from "./ClassSelections";
import { LikeDislike } from "./LikeDislike";

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

const Home = () => {
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const sensitiveToggled = useSelector((state: any) => state.sensitive.sensitiveContent);

  const Toast = useToast();
  const tabs = useTabsContext();
  const [user] = useAuthState(auth);
  const history = useHistory();

  const timeAgo = new TimeAgo("en-US");
  const inputRef = useRef<HTMLIonTextareaElement>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showReloadMessage, setShowReloadMessage] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [photo, setPhoto] = useState<GalleryPhoto[] | null>([]);
  const [blob, setBlob] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[] | null>(null);
  const postsRef = useRef<any>();
  postsRef.current = posts;
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
  const [lastKey, setLastKey] = useState<string>("");
  const [position, setPosition] = useState<Geoposition | null>();
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
        await timeout(100);
      }
    } else {
      Toast.error("Unable to like post :(");
      // setDisabledLikeButtons(-1);
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
        await timeout(100);
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
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
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  };

  async function messageAdd() {
    const messageRefValue = inputRef.current;
    if (!messageRefValue) {
      Toast.error("Input a message!");
      return;
    }
    const message: string | null | undefined = messageRefValue.value;
    if (!message) {
      Toast.error("Input a message!");
      return;
    }
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
            if (inputRef && inputRef.current) { inputRef.current.value = ""; }
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
          if (inputRef && inputRef.current) { inputRef.current.value = ""; }
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

  const handleImgLoad = (didLoad: boolean) => {
    if (didLoad) {
      console.log("img loaded");
      virtuosoRef && virtuosoRef.current && virtuosoRef.current.autoscrollToBottom();
    }
  };

  useEffect(() => { // run on app startup
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
        // console.log(change.type);
        // console.log(change.doc.data());
        if (auth && auth.currentUser && auth.currentUser.uid) {
          if ((change.type === "added") && change.doc.data().uid === auth.currentUser.uid && snapshot.docChanges().length === 2) {
            let datasCopy = newDataRef.current || [];
            // console.log(datasCopy);
            let justAdded: any[] = [];
            for (let i = 0; i < datasCopy.length; ++i) {
              datasCopy[i].likes = { 'null': true };
              datasCopy[i].dislikes = { 'null': true };
              datasCopy[i].commentAmount = 0;
            }
            // console.log(datasCopy);
            justAdded.push({
              ...change.doc.data(),
              key: change.doc.id
            });
            justAdded[0].likes = { 'null': true };
            justAdded[0].dislikes = { 'null': true };
            justAdded[0].commentAmount = 0;
            // console.log(justAdded);
            const finalData: any[] = justAdded.concat(datasCopy);
            // console.log(finalData);
            await timeout(500);
            setPosts([...finalData, ...postsRef.current]);
            virtuosoRef && virtuosoRef.current && virtuosoRef.current.scrollTo({ top: 0, behavior: "auto" })
            setNewPostsLoaded(false);
            setNewData([]);
            break; // needed?
          } else {
            // console.log("long if check failed")
            // console.log(change.type === "added");
            // console.log(change.doc.data().uid === auth.currentUser.uid);
            // console.log(snapshot.docChanges().length);
          }
        } else {
          // console.log("something wrong with auth")
        }
        if (change.type === "added") {
          data.push({
            ...change.doc.data(),
            key: change.doc.id,
          });
        }
      }
      // console.log("after for each");
      if (data.length > 0) {
        // console.log("data length > 0");
        if (postsRef.current) {
          // console.log("post ref current");
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
          // console.log(newData);
          // console.log(newDataRef.current);
          // console.log("after data for loop");
          // console.log(data);
          if (newDataRef.current) {
            // console.log("more than 1 new post");
            setNewData([...data, ...newDataRef.current])
          } else {
            // console.log("Only one new post");
            setNewData(data);
          }
          // console.log("after set data");
          setNewPostsLoaded(true);
          // console.log("after set true");
        } else { // on init
          // console.log("init");
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
  };

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

  if (posts && posts.length > 0) {
    return (
      <IonPage className="ion-page-ios-notch">

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
              <IonFooter mode='ios' slot="bottom">
                <IonProgressBar type="indeterminate" color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} style={{ height: "0.5vh" }}></IonProgressBar>
              </IonFooter>
            </FadeIn>
          }
        </div>

        <IonContent fullscreen scrollY={false}>

          <Virtuoso
            ref={virtuosoRef}
            overscan={1000}
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
                    <IonItem lines="none" mode="ios" onClick={() => { history.push("/post/" + post.key); }}>
                      <IonLabel class="ion-text-wrap">
                        <IonText color="medium">
                          <IonAvatar
                            onClick={(e) => {
                              e.stopPropagation();
                              history.push("/about/" + post.uid);
                            }}
                            class="posts-avatar"
                          >
                            <ProfilePhoto uid={post.uid}></ProfilePhoto>
                          </IonAvatar>
                          <p>
                            {post.userName}
                          </p>
                        </IonText>
                        {post.postType ? (
                          <IonFab vertical="top" horizontal="end" onClick={(e) => {
                            if (post.postType !== "general") {
                              e.stopPropagation();
                              history.push("/type/" + post.postType);
                            }
                          }}>
                            {post.postType !== "general" ?
                              <p style={{ fontWeight: "bold", color: getColor(post.postType) }} >
                                {post.postType.toUpperCase()}
                                &nbsp;
                                {post.marker ? (
                                  <RoomIcon
                                    style={{ fontSize: "1em" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      localStorage.setItem("lat", (post.location[0].toString()));
                                      localStorage.setItem("long", (post.location[1].toString()));
                                      history.push("/maps");
                                    }}
                                  />
                                ) : null}
                              </p>
                              :
                              <p style={{ fontWeight: "bold", color: getColor(post.postType), marginLeft: "75%" }} >
                                {post.marker ? (
                                  <RoomIcon onClick={(e) => {
                                    e.stopPropagation();
                                    localStorage.setItem("lat", (post.location[0].toString()));
                                    localStorage.setItem("long", (post.location[1].toString()));
                                    history.push("/maps");
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
                                history.push("/class/" + post.className);
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

                    <LikeDislike handleUpVote={handleUpVote} handleDownVote={handleDownVote} user={user} schoolName={schoolName} schoolColorToggled={schoolColorToggled} post={post} index={index} />

                  </IonList>
                </FadeIn>
              )
            }}

            components={{ Footer, Header }} />

        </IonContent>

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
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={showModal} animated mode='ios' swipeToClose={false} handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
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
                      });
                    }}
                  >
                    Close
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </div>
            <IonCard >
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
                        placeholder="Start typing..."
                        id="message"
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
                        disabled={prevPostUploading}
                        placeholder="Start typing..."
                        id="message"
                      ></IonTextarea>
                    </>
                  )}
              </IonRow>
              <br /> <br /> <br />
              <IonRow>

                <ClassSelections setPostClassName={setPostClassName} setPostClassNumber={setPostClassNumber} schoolName={schoolName} postClassNumber={postClassNumber} postClassName={postClassName} />

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
                      setLocationPinModal(true);
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
                  <br />
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

            </IonCard>
            {prevPostUploading &&
              <p style={{ textAlign: "center" }}>Wait until previous post has <br />uploaded to post again</p>}
          </IonContent>
        </IonModal>

      </IonPage >
    )
  } else if (showReloadMessage) {
    return (
      <IonPage>
        <IonContent>

          <IonHeader class="ion-no-border" style={ionHeaderStyle}>
            <TellUHeader />
          </IonHeader>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div style={{ textAlign: "center" }}>
              <p>Check your internet connection and try again</p>
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
};

export default Home;