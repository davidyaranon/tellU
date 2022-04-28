import "../App.css";
import { Link } from "react-router-dom";
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
  IonListHeader,
  IonCardContent,
  IonSpinner,
  IonNote,
} from "@ionic/react";
import auth, { removeComment } from "../fbconfig";
import {
  db,
  addMessage,
  storage,
  uploadImage,
  addComment,
  getAllPosts,
  promiseTimeout,
  upVote,
  downVote,
  loadComments,
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
  chatbubblesOutline,
} from "ionicons/icons";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import DeleteIcon from "@mui/icons-material/Delete";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import SignalWifiOff from "@mui/icons-material/SignalWifiOff";
import { chevronDownCircleOutline } from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import defaultMessages from "../components/funnies";
import { RefresherEventDetail } from "@ionic/core";
import MapIcon from "@mui/icons-material/Map";
import Header, { ionHeaderStyle } from "./Header";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
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

TimeAgo.addDefaultLocale(en);

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

defineCustomElements(window);

function Home() {
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const timeAgo = new TimeAgo("en-US");
  const { setShowTabs } = React.useContext(UIContext);
  const schoolName = useSelector((state: any) => state.user.school);
  const hasLoaded = useSelector((state: any) => state.user.hasLoaded);
  const [busy, setBusy] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [photo, setPhoto] = useState<Photo | null>();
  const Toast = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalPicture, setShowModalPicture] = useState<boolean>(false);
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [showReloadMessage, setShowReloadMessage] = useState<boolean>(false);
  const [modalImgSrc, setModalImgSrc] = useState("");
  const [photos, setPhotos] = useState<Photo | null>();
  const [blob, setBlob] = useState<any | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [messageSent, setMessageSent] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [comments, setComments] = useState<any[] | null>(null);
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
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
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const [user] = useAuthState(auth);
  const [commentModalPostIndex, setCommentModalPostIndex] =
    useState<number>(-1);
  const [commentModalPostUpvotes, setCommentModalPostUpvotes] =
    useState<number>(-1);
  const [commentModalPostDownvotes, setCommentModalPostDownvotes] =
    useState<number>(-1);
  const [commentModalPost, setCommentModalPost] = useState<any | null>(null);
  const history = useHistory();
  const min = 0;
  const max = defaultMessages.length - 1;
  const [position, setPosition] = useState<Geoposition | null>();
  const [loadingMessage, setLoadingMessage] = useState("");

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
  const handleCommentSubmit = async (postKey: string) => {
    if (comment.trim().length == 0) {
      Toast.error("Input a comment");
    } else {
      setCommentsBusy(true);
      const hasTimedOut = promiseTimeout(
        10000,
        addComment(postKey, schoolName, comment)
      );
      hasTimedOut.then((commentSent) => {
        setComment("");
        if (commentSent) {
          Toast.success("Comment added");
          if (posts) {
            let tempPosts: any[] = [...posts];
            tempPosts[commentModalPostIndex].commentAmount += 1;
            setPosts(tempPosts);
          }
          try {
            // load comments from /schoolPosts/{schoolName}/comments/{post.key}
            const commentsHasTimedOut = promiseTimeout(
              10000,
              loadComments(postKey, schoolName)
            );
            commentsHasTimedOut.then((resComments) => {
              if (resComments == null || resComments == undefined) {
                Toast.error(
                  "Comments are currently broken on this post, try again later"
                );
              } else {
                //console.log(resComments);
                setComments(resComments);
              }
            });
            commentsHasTimedOut.catch((err) => {
              Toast.error(err);
              setCommentsBusy(false);
            });
          } catch (err: any) {
            console.log(err);
            Toast.error(err.message.toString());
          }
        } else {
          Toast.error("Unable to comment on post");
        }
        setCommentsBusy(false);
      });
      hasTimedOut.catch((err) => {
        Toast.error(err);
        setCommentsBusy(false);
      });
    }
  };
  const handleUpVote = async (postKey: string, index: number) => {
    const val = await upVote(schoolName, postKey);
    if (val && (val === 1 || val === -1)) {
      if (posts && user) {
        let tempPosts: any[] = [...posts];
        tempPosts[index].upVotes += val;
        setCommentModalPostUpvotes(commentModalPostUpvotes + val);
        if (tempPosts[index].likes[user.uid]) {
          delete tempPosts[index].likes[user.uid];
        } else {
          if (tempPosts[index].dislikes[user.uid]) {
            delete tempPosts[index].dislikes[user.uid];
            tempPosts[index].downVotes -= 1;
            setCommentModalPostDownvotes(commentModalPostDownvotes - 1);
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

  const handleDownVote = async (postKey: string, index: number) => {
    const val = await downVote(schoolName, postKey);
    if (val && (val === 1 || val === -1)) {
      if (posts && user) {
        let tempPosts: any[] = [...posts];
        setCommentModalPostDownvotes(commentModalPostDownvotes + val);
        tempPosts[index].downVotes += val;
        if (tempPosts[index].dislikes[user.uid]) {
          delete tempPosts[index].dislikes[user.uid];
        } else {
          if (tempPosts[index].likes[user.uid]) {
            delete tempPosts[index].likes[user.uid];
            tempPosts[index].upVotes -= 1;
            setCommentModalPostUpvotes(commentModalPostUpvotes - 1);
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

  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
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
    const time = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    return timeAgo.format(time);
  };

  const getColor = (postType: string) => {
    switch (postType) {
      case "general":
        return "#61DBFB";
      case "alert":
        return "#ff3e3e";
      case "buy/Sell":
        return "#179b59";
      case "event":
        return "#fc4ad3";
      case "sighting":
        return "#eed202";
      default:
        break;
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

  const deleteComment = async (index : number) => {
    setCommentsLoading(true);
    if(comments && commentModalPost && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(5000, removeComment(commentBeingDeleted, schoolName, commentModalPost.key));
      didDelete.then((res) => {
        if(res) {
          Toast.success("Comment deleted");
          if(comments.length == 0) {
            setComments([]);
          } else {
            let tempComments : any[] = [];
            for(let i = 0; i < comments.length; ++i) {
              if(i !== index) {
                tempComments.push(comments[i]);
              }
            }
            setComments(tempComments);
            //console.log(tempComments);
          }
          setCommentsLoading(false);
        } else {
          Toast.error("Unable to delete comment");
          setCommentsLoading(false);
        }
      });
      didDelete.catch((err) => {
        Toast.error(err);
        setCommentsLoading(false);
      })
    } else {
      Toast.error("Unable to delete comment");
      setCommentsLoading(false);
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
      Toast.error(e.message.toString());
      setGettingLocation(false);
    }
  };

  const handleLoadPosts = () => {
    setBusy(true);
    let tempPosts = promiseTimeout(20000, getAllPosts(schoolName));
    tempPosts.then((allPosts: any[]) => {
      if (allPosts && allPosts != []) {
        setPosts(allPosts);
        //console.log(allPosts);
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
    handleLoadPosts();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  }

  function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }

  function showPicture(src: string) {
    // setModalImgSrc(src);
    // setShowModalPicture(true);
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

  const handleCommentModal = async (post: any, postIndex: number) => {
    setCommentModalPostIndex(postIndex);
    setCommentModalPostDownvotes(post.downVotes);
    setCommentModalPostUpvotes(post.upVotes);
    setCommentModalPost(post);
    setCommentsLoading(true);
    setShowModalComment(true);
    try {
      // load comments from /schoolPosts/{schoolName}/comments/{post.key}
      const resComments = await loadComments(post.key, schoolName);
      if (resComments != null && resComments != undefined) {
        //console.log(resComments);
        setComments(resComments);
        setCommentsLoading(false);
      } else {
        //console.log(resComments);
        Toast.error(
          "Comments are currently broken on this post, try again later"
        );
      }
    } catch (err: any) {
      console.log(err);
      Toast.error(err.message.toString());
    }
  };

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
      setBusy(true);
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
        Toast.error("Unable to process message :(");
      } else {
        Toast.success("Uploaded!");
        setMessageSent(true);
        setMessage("");
        handleLoadPosts();
      }
      setBusy(false);
    }
  }

  // const loadLoadingMessage = () => {
  //   let rand = Math.floor( min + Math.random() * (max - min) );
  //   setLoadingMessage(defaultMessages[rand]);
  // }

  useEffect(() => {
    setShowTabs(true);
    setBusy(true);
    if (!user) {
      setBusy(false);
      history.replace("/landing-page");
    } else if (schoolName) {
      //console.log(user);
      handleLoadPosts();
    }
  }, [schoolName]);

  if (posts) {
    return (
      <React.Fragment>
        <IonContent>
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
            message="Loading posts"
            duration={0}
            isOpen={busy}
          ></IonLoading>

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
            breakpoints={[0, 0.9]}
            initialBreakpoint={0.9}
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
              <br></br>
              <IonList inset={true} mode="ios">
                <IonListHeader mode="ios">Select One</IonListHeader>
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
                  <IonLabel> Add pin to map?* </IonLabel>
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
                <p>
                  {" "}
                  *Adding a pin uses your current location, and is visible for
                  up to two days in the {<MapIcon />} tab
                </p>
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
            <div className="ion-modal">
              <IonTextarea
                color="secondary"
                maxlength={250}
                style={ionInputStyle}
                value={message}
                placeholder="Start typing..."
                id="message"
                onIonChange={(e: any) => {
                  handleChange(e);
                }}
              ></IonTextarea>
              <IconButton onClick={takePicture}>
                <IonFabButton mode="ios" color="medium">
                  <IonIcon icon={cameraOutline} />
                </IonFabButton>
              </IconButton>
              <IonFab style={{ top: "15.7vh" }} horizontal="end">
                <IonButton
                  onClick={() => {
                    setPhoto(null);
                    setBlob(null);
                    setShowModal(false);
                  }}
                  color="danger"
                  mode="ios"
                  shape="round"
                  fill="outline"
                  id="close"
                >
                  {" "}
                  Close{" "}
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

          <IonModal backdropDismiss={false} isOpen={showModalComment}>
            <IonContent>
              <div className="ion-modal">
                <IonToolbar mode="ios">
                  <IonButtons slot="start">
                    <IonButton
                      onClick={() => {
                        setComments([]);
                        setShowModalComment(false);
                        setComment("");
                      }}
                    >
                      <IonIcon icon={arrowBack}></IonIcon> Back
                    </IonButton>
                  </IonButtons>
                </IonToolbar>

                {commentModalPost ? (
                  <FadeIn>
                    <div>
                      <IonList inset={true}>
                        <IonItem lines="none">
                          <IonLabel class="ion-text-wrap">
                            <IonText color="medium">
                              <p>
                                <IonAvatar
                                  onClick={() => {
                                    setComments([]);
                                    setShowModalComment(false);
                                    setComment("");
                                    handleUserPageNavigation(
                                      commentModalPost.uid
                                    );
                                  }}
                                  class="posts-avatar"
                                >
                                  <IonImg
                                    src={commentModalPost.photoURL}
                                  ></IonImg>
                                </IonAvatar>
                                {commentModalPost.userName}
                              </p>
                            </IonText>
                            {commentModalPost.postType != "general" ? (
                              <IonFab vertical="top" horizontal="end">
                                <p
                                  style={{
                                    fontWeight: "bold",
                                    color: getColor(commentModalPost.postType),
                                  }}
                                >
                                  {commentModalPost.postType.toUpperCase()}
                                </p>
                              </IonFab>
                            ) : null}
                            <h2 className="h2-message">
                              {commentModalPost.message}
                            </h2>
                          </IonLabel>
                          <div
                            id={commentModalPost.postType.replace("/", "")}
                          ></div>
                        </IonItem>
                        <IonItem lines="none" mode="ios">
                          <IonButton
                            onAnimationEnd={() => {
                              setLikeAnimation(-1);
                            }}
                            className={
                              likeAnimation === commentModalPostIndex
                                ? "likeAnimation"
                                : ""
                            }
                            disabled={
                              disabledLikeButtons === commentModalPostIndex
                            }
                            mode="ios"
                            fill="outline"
                            color={
                              posts &&
                              user &&
                              posts[commentModalPostIndex].likes[user.uid] !==
                                undefined
                                ? "primary"
                                : "medium"
                            }
                            onClick={() => {
                              setLikeAnimation(commentModalPostIndex);
                              setDisabledLikeButtons(commentModalPostIndex);
                              handleUpVote(
                                commentModalPost.key,
                                commentModalPostIndex
                              );
                            }}
                          >
                            <KeyboardArrowUpIcon />
                            <p>{commentModalPostUpvotes} </p>
                          </IonButton>
                          <p>&nbsp;</p>
                          <IonButton
                            onAnimationEnd={() => {
                              setDislikeAnimation(-1);
                            }}
                            className={
                              dislikeAnimation === commentModalPostIndex
                                ? "likeAnimation"
                                : ""
                            }
                            disabled={
                              disabledLikeButtons === commentModalPostIndex
                            }
                            mode="ios"
                            fill="outline"
                            color={
                              posts &&
                              user &&
                              posts[commentModalPostIndex].dislikes[
                                user.uid
                              ] !== undefined
                                ? "danger"
                                : "medium"
                            }
                            onClick={() => {
                              setDislikeAnimation(commentModalPostIndex);
                              setDisabledLikeButtons(commentModalPostIndex);
                              handleDownVote(
                                commentModalPost.key,
                                commentModalPostIndex
                              );
                            }}
                          >
                            <KeyboardArrowDownIcon />
                            <p>{commentModalPostDownvotes} </p>
                          </IonButton>
                        </IonItem>
                      </IonList>
                      <div className="verticalLine"></div>
                      {commentModalPost.imgSrc &&
                      commentModalPost.imgSrc.length > 0 ? (
                        <IonCard style={{ bottom: "7.5vh" }}>
                          <IonCardContent>
                            <IonImg
                              onClick={() => {
                                PhotoViewer.show(commentModalPost.imgSrc);
                              }}
                              src={commentModalPost.imgSrc}
                            ></IonImg>
                          </IonCardContent>
                        </IonCard>
                      ) : null}
                    </div>
                  </FadeIn>
                ) : null}
                <p style={{ textAlign: "center" }}>Comments</p>
                <br></br>
                {commentsLoading || !comments ? (
                  <div
                    style={{
                      alignItems: "center",
                      textAlign: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <IonSpinner color="primary" />
                  </div>
                ) : (
                  <FadeIn>
                    <div>
                      {comments && comments.length > 0
                        ? comments?.map((comment: any, index) => (
                            <IonList inset={true} key={index}>
                              {" "}
                              <IonItem lines="none">
                                <IonLabel class="ion-text-wrap">
                                  <IonText color="medium">
                                    <p>
                                      <IonAvatar
                                        onClick={() => {
                                          setComments([]);
                                          setShowModalComment(false);
                                          setComment("");
                                          handleUserPageNavigation(comment.uid);
                                        }}
                                        class="posts-avatar"
                                      >
                                        <IonImg
                                          src={comment?.photoURL!}
                                        ></IonImg>
                                      </IonAvatar>
                                      {comment.userName}
                                    </p>
                                  </IonText>
                                  <h2 className="h2-message">
                                    {" "}
                                    {comment.comment}{" "}
                                  </h2>
                                  {/* {comment.url.length > 0 ? (
                                    <div className="ion-img-container">
                                      <br></br>
                                      <IonImg
                                        onClick={() => {
                                          showPicture(comment.imgSrc);
                                        }}
                                        src={comment.imgSrc}
                                      />
                                    </div>
                                  ) : null} */}
                                </IonLabel>
                                <div></div>
                              </IonItem>
                              <IonItem lines="none" mode="ios">
                                <IonButton
                                  mode="ios"
                                  fill="outline"
                                  color="medium"
                                >
                                  <KeyboardArrowUpIcon />
                                  <p>{comment.upVotes} </p>
                                </IonButton>
                                <IonButton
                                  mode="ios"
                                  fill="outline"
                                  color="medium"
                                >
                                  <KeyboardArrowDownIcon />
                                  <p>{comment.downVotes} </p>
                                </IonButton>
                                {user && user.uid === comment.uid ? (
                                  <IonFab horizontal="end">
                                    <IonButton
                                      mode="ios"
                                      fill="outline"
                                      color="danger"
                                      onClick={() => {deleteComment(index);}}
                                    >
                                      <DeleteIcon />
                                    </IonButton>
                                  </IonFab>
                                ) : null}
                              </IonItem>
                            </IonList>
                          ))
                        : null}
                    </div>
                  </FadeIn>
                )}

                <IonTextarea
                  color="secondary"
                  spellcheck={true}
                  maxlength={200}
                  style={ionInputStyle}
                  value={comment}
                  placeholder="Leave a comment..."
                  id="message"
                  onIonChange={(e: any) => {
                    handleChangeComment(e);
                  }}
                ></IonTextarea>
                <div className="ion-button-container">
                  <IonButton
                    color="transparent"
                    mode="ios"
                    shape="round"
                    fill="outline"
                    expand="block"
                    id="signUpButton"
                    onClick={() => {
                      handleCommentSubmit(commentModalPost.key);
                    }}
                  >
                    Comment
                  </IonButton>
                </div>

                <br></br>
              </div>
            </IonContent>
          </IonModal>

          {posts!.length > 0 ? (
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
                        posts &&
                        user &&
                        posts[index].likes[user.uid] !== undefined
                          ? "primary"
                          : "medium"
                      }
                      onClick={() => {
                        setLikeAnimation(post.key);
                        setDisabledLikeButtons(index);
                        handleUpVote(post.key, index);
                      }}
                    >
                      <KeyboardArrowUpIcon />
                      <p>{post.upVotes} </p>
                    </IonButton>
                    <p>&nbsp;</p>
                    <IonButton
                      mode="ios"
                      color="medium"
                      onClick={() => {
                        handleCommentModal(post, index);
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
                        posts &&
                        user &&
                        posts[index].dislikes[user.uid] !== undefined
                          ? "danger"
                          : "medium"
                      }
                      onClick={() => {
                        setDislikeAnimation(post.key);
                        setDisabledLikeButtons(index);
                        handleDownVote(post.key, index);
                      }}
                    >
                      <KeyboardArrowDownIcon />
                      <p>{post.downVotes} </p>
                    </IonButton>
                  </IonItem>
                </IonList>
              </FadeIn>
            ))
          ) : (
            <div>
              <h3 className="h3-error">
                {" "}
                Unable to load posts, swipe down from top to reload page{" "}
              </h3>
              <div className="h3-error">
                <SignalWifiOff
                  fontSize="large"
                  style={{ fontSize: "4.10vh" }}
                />
              </div>
            </div>
          )}
        </IonContent>
      </React.Fragment>
    );
  } else if (showReloadMessage) {
    return (
      <React.Fragment>
        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent
              pullingIcon={chevronDownCircleOutline}
              pullingText="Pull to refresh"
              refreshingSpinner="crescent"
              refreshingText="Refreshing..."
            ></IonRefresherContent>
          </IonRefresher>

          <IonLoading
            spinner="dots"
            message="Please wait..."
            duration={0}
            isOpen={busy}
          ></IonLoading>

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
      </React.Fragment>
    );
  } else {
    return <IonLoading spinner="dots" duration={0} isOpen={busy}></IonLoading>;
  }
}

export default React.memo(Home);
