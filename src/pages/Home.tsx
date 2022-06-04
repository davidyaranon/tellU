import "../App.css";
import {
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
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
  useIonViewDidLeave,
  IonPage,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import auth, { getAllPostsNextBatch, getLikes, storage } from "../fbconfig";
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
import { ref, getDownloadURL } from "firebase/storage";
import { Geolocation, Geoposition } from "@awesome-cordova-plugins/geolocation";
import { Keyboard } from "@capacitor/keyboard";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  add,
  arrowBack,
  cameraOutline,
  shareOutline,
} from "ionicons/icons";
import RoomIcon from '@mui/icons-material/Room';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
// import { PhotoViewer, Image } from '@capacitor-community/photoviewer';  USE THIS WHEN IMPLEMENTING VIDEOS, FOR NOW CAUSES STRANGE FLICKER (RE-REDNERING?)
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
import Linkify from 'linkify-react';

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);

declare var window: any;

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

defineCustomElements(window);

function Home() {
  const inputRef = useRef<any>(null);
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [originalLastKey, setOriginalLastKey] = useState<string>("");

  useIonViewWillEnter(() => {
    setShowTabs(true);
    // console.log(lastKey);
    // if (posts && schoolName) {
    //   setBusy(true);
    //   let tempPosts = promiseTimeout(20000, getAllPosts(schoolName));
    //   tempPosts.then(async (res: any) => {
    //     if (res.allPosts && res.allPosts != [] && res.allPosts.length != 0) { // newly updated posts
    //       let caught = false;
    //       let length = posts.length > res.allPosts.length ? res.allPosts.length : posts.length;
    //       for (let i = 0; i < length; ++i) {
    //         if (res.allPosts[i].message != posts[i].message) {
    //           for(let i = 0; i < res.allPosts.length; ++i) {
    //             const data = await getLikes(res.allPosts[i].key);
    //             if(data){
    //               res.allPosts[i].likes = data.likes;
    //               res.allPosts[i].dislikes = data.dislikes;
    //               res.allPosts[i].commentAmount = data.commentAmount;
    //             } else {
    //               res.allPosts[i].likes = {};
    //               res.allPosts[i].dislikes = {};
    //               res.allPosts[i].commentAmount = 0;
    //             }
    //           }
    //           setNewPostsLoaded(true);
    //           setNewPosts(res.allPosts);
    //           caught = true;
    //           break;
    //         }
    //       }
    //       if (!caught) {
    //         for(let i = 0; i < res.allPosts.length; ++i) {
    //           const data = await getLikes(res.allPosts[i].key);
    //           if(data){
    //             res.allPosts[i].likes = data.likes;
    //             res.allPosts[i].dislikes = data.dislikes;
    //             res.allPosts[i].commentAmount = data.commentAmount;
    //           } else {
    //             res.allPosts[i].likes = {};
    //             res.allPosts[i].dislikes = {};
    //             res.allPosts[i].commentAmount = 0;
    //           }
    //         }
    //         setPosts(res.allPosts);
    //       }
    //       setLastKey(res.lastKey);
    //     }
    //     setBusy(false);
    //   });
    //   tempPosts.catch((err: any) => {
    //     Toast.error(err + "\n Check your internet connection");
    //     setBusy(false);
    //   });
    // }
  }, [posts, schoolName]);

  const sharePost = async (post: any) => {
    await Share.share({
      title: post.userName + "'s Post",
      text: 'Let me tellU about this post I saw. \n\n' + "\"" + post.message + '\"\n\n',
      url: 'http://tellUapp.com/post/' + post.key,
    });
  }

  const scrollToTop = () => {
    contentRef.current && contentRef.current.scrollToTop(1500);
  };

  const ionInputStyle = {
    height: "12.5vh",
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
    const val = await upVote(postKey, post);
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
    const val = await downVote(postKey);
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
      tempPosts.then(async (res: any) => {
        if (res.allPosts && res.allPosts != []) {
          for(let i = 0; i < res.allPosts.length; ++i) {
            const data = await getLikes(res.allPosts[i].key);
            if(data){
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
    tempPosts.then(async (res: any) => {
      if (res.allPosts && res.allPosts != []) {
        for(let i = 0; i < res.allPosts.length; ++i) {
          const data = await getLikes(res.allPosts[i].key);
          if(data){
            res.allPosts[i].likes = data.likes;
            res.allPosts[i].dislikes = data.dislikes;
            res.allPosts[i].commentAmount = data.commentAmount;
          } else {
            res.allPosts[i].likes = {};
            res.allPosts[i].dislikes = {};
            res.allPosts[i].commentAmount = 0;
          }
        }
        // console.log(res.allPosts);
        setPosts(res.allPosts);
        setLastKey(res.lastKey);
        setOriginalLastKey(res.lastKey);
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
    setLastKey(originalLastKey);
    handleLoadPosts();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  }

  async function sendImage(blob: any, uniqueId: string) {
    const res = await uploadImage("images", blob, uniqueId);
    if (res == false || photo == null || photo?.webPath == null) {
      Toast.error("unable to select photo");
    } else {
      // Toast.success("photo uploaded successfully");
    }
  }

  // function b64ToBlob(b64Data: any, contentType: string, sliceSize: number) {
  //   var byteCharacters = atob(b64Data);
  //   var byteArrays = [];

  //   for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //     var slice = byteCharacters.slice(offset, offset + sliceSize);

  //     var byteNumbers = new Array(slice.length);
  //     for (var i = 0; i < slice.length; i++) {
  //       byteNumbers[i] = slice.charCodeAt(i);
  //     }

  //     var byteArray = new Uint8Array(byteNumbers);

  //     byteArrays.push(byteArray);
  //   }

  //   var blob = new Blob(byteArrays, { type: contentType });
  //   return blob;
  // }

  // function makeFileIntoBlob(_imagePath: string, contentType: string) {
  //   // INSTALL PLUGIN - cordova plugin add cordova-plugin-file
  //   return new Promise((resolve, reject) => {
  //     let fileName = "";
  //     File
  //       .resolveLocalFilesystemUrl(_imagePath)
  //       .then(fileEntry => {
  //         let { name, nativeURL } = fileEntry;

  //         // get the path..
  //         let path = nativeURL.substring(0, nativeURL.lastIndexOf("/"));

  //         fileName = name;

  //         // we are provided the name, so now read the file into a buffer
  //         return File.readAsArrayBuffer(path, name);
  //       })
  //       .then(buffer => {
  //         // get the buffer and make a blob to be saved
  //         let imgBlob = new Blob([buffer], {
  //           type: contentType
  //         });
  //         console.log(imgBlob);
  //         setBlob(imgBlob);
  //         // pass back blob and the name of the file for saving
  //         // into fire base
  //         resolve({
  //           fileName,
  //           imgBlob
  //         });
  //       })
  //       .catch(e => reject(e));
  //   });
  // }

  // function getBlob(b64Data: string, contentType: string, sliceSize: number = 512) {
  //   contentType = contentType || '';
  //   sliceSize = sliceSize || 512;
  //   let byteCharacters = atob(b64Data);
  //   let byteArrays = [];

  //   for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //     let slice = byteCharacters.slice(offset, offset + sliceSize);

  //     let byteNumbers = new Array(slice.length);
  //     for (let i = 0; i < slice.length; i++) {
  //       byteNumbers[i] = slice.charCodeAt(i);
  //     }

  //     let byteArray = new Uint8Array(byteNumbers);

  //     byteArrays.push(byteArray);
  //   }
  //   let blob = new Blob(byteArrays, { type: contentType });
  //   return blob;
  // }


  // function success(fileEntry: any) {
  //   fileEntry.file(function (file: any) {
  //     var reader = new FileReader();
  //     reader.onloadend = function (e) {
  //       var content = this.result;
  //       // console.log(content);
  //     };
  //   });
  // }

  var win = function (r: any) {
    // console.log("Code = " + r.responseCode);
    // console.log("Response = " + r.response);
    // console.log("Sent = " + r.bytesSent);
  }

  var fail = function (error: any) {
    // alert("An error has occurred: Code = " + error.code);
    // console.log("upload error source " + error.source);
    // console.log("upload error target " + error.target);
  }

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
  }

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
      setBusy(false);
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
      getDownloadURL(ref(storage, "profilePictures/" + user.uid + "photoURL"))
        .then((url: string) => {
          setProfilePhoto(url);
        })
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
              <p style={{textAlign:"center"}}>*Location pin stays on map for up to two days</p>
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
                  Post
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
                        Keyboard.hide().then(() => {
                          setTimeout(() => setShowModal(false), 100)
                        });
                      }}
                    >
                      <IonIcon icon={arrowBack}></IonIcon> Back
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
                            ref={(ref) => inputRef.current = ref}
                            rows={4}
                            color="secondary"
                            maxlength={500}
                            // style={ionInputStyle}
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
                            autofocus={true}
                            ref={(ref) => inputRef.current = ref}
                            rows={5}
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
                        </>
                      )}
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
                          handlePostOptions();
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
            </IonContent>
          </IonModal>

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton
              onClick={() => {
                setShowModal(true);
                // inputRef.current.setFocus();
              }}
            >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          {/* <IonModal backdropDismiss={false} isOpen={showModalPicture}>
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
          </IonModal> */}

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
                            {post.postType ? (
                              <IonFab horizontal="end">
                                {post.postType !== "general" ?
                                  <p
                                    style={{
                                      fontWeight: "bold",
                                      color: getColor(post.postType),
                                    }}
                                  // onClick={() => {
                                  //   localStorage.setItem("lat", (post.location[0].toString()));
                                  //   localStorage.setItem("long", (post.location[1].toString()));
                                  //   history.push("maps");
                                  // }}
                                  >
                                    {post.postType.toUpperCase()}
                                    &nbsp;
                                    {post.marker ? (
                                      <RoomIcon
                                        style={{ fontSize: "1em" }}
                                        onClick={() => {
                                          localStorage.setItem("lat", (post.location[0].toString()));
                                          localStorage.setItem("long", (post.location[1].toString()));
                                          history.push("maps");
                                        }}
                                      />
                                    ) : null}
                                  </p>
                                  :
                                  <p
                                    style={{
                                      fontWeight: "bold",
                                      color: getColor(post.postType),
                                    }}
                                  >
                                    {post.marker ? (
                                      <RoomIcon onClick={() => {
                                        localStorage.setItem("lat", (post.location[0].toString()));
                                        localStorage.setItem("long", (post.location[1].toString()));
                                        history.push("maps");
                                      }}
                                        style={{ fontSize: "1em" }} />
                                    ) : null}
                                  </p>
                                }
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
                      <Linkify tagName="h3" className="h2-message" style={{ marginLeft: "1.75%" }}>
                        {post.message}
                      </Linkify>
                      {/* <h3 className="h2-message" style={{ marginLeft: "2.5%" }}>
                        {" "}
                        {post.message}{" "}
                      </h3> */}
                      {"imgSrc" in post && post.imgSrc && post.imgSrc.length > 0 ? (
                        <div className="ion-img-container">
                          <br></br>
                          <IonImg
                            onClick={() => {
                              PhotoViewer.show(post.imgSrc, `${post.userName}'s post`);
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
                      <p>{Object.keys(post.likes).length - 1} </p>
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
                      <p>{Object.keys(post.dislikes).length - 1} </p>
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
            onIonInfinite={(e: any) => { console.log("handling infinite"); handleLoadPostsNextBatch(e) }}
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