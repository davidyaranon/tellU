import {
  IonContent,
  IonCardTitle,
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
  IonButton,
  IonIcon,
  IonFab,
  IonToolbar,
  IonButtons,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonRow,
  IonCol,
  IonSpinner,
  IonNote,
  IonPage,
  useIonViewDidEnter,
  IonGrid,
} from "@ionic/react";
import { arrowBack, schoolOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import auth, { removeComment } from "../fbconfig";
import {
  addComment,
  db,
  downVote,
  loadComments,
  promiseTimeout,
  upVote,
} from "../fbconfig";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import "../App.css";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { Map, Marker, ZoomControl, Overlay } from "pigeon-maps";
import { useToast } from "@agney/ir-toast";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import FadeIn from "react-fade-in";
import DeleteIcon from "@mui/icons-material/Delete";
import TimeAgo from "javascript-time-ago";
import { timeout } from "../components/functions";


const schoolInfo = {
  "Cal Poly Humboldt": [40.875130691835615, -124.07857275064532, 16.25],
  "UC Berkeley": [37.87196553251828, -122.25832234237413, 15.5],
  "UC Davis": [38.53906813693881, -121.7519863294826, 15],
  "UC Irvine": [33.642798513829284, -117.83657521816043, 14.5],
  UCLA: [34.068060230062784, -118.4450963024167, 15.5],
  "UC Merced": [37.362385, -120.427911, 15],
  "UC Riverside": [33.972975051337265, -117.32790083366463, 16],
  "UC San Diego": [32.8791284369769, -117.2368054903461, 15],
  UCSF: [37.76894651194302, -122.42952641954717, 13],
  "UC Santa Barbara": [34.41302723872466, -119.84749752183016, 15],
  "UC Santa Cruz": [36.994178678923895, -122.05892788857311, 15],
  "": [37.250458, -120.350249, 6],
};

function Maps() {
  const Toast = useToast();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [center, setCenter] = useState<[number, number]>([
    37.250458, -120.350249,
  ]);
  const [zoom, setZoom] = useState(6);
  const [defaultLat, setDefaultLat] = useState(0);
  const [defaultLong, setDefaultLong] = useState(0);
  const [defaultZoom, setDefaultZoom] = useState(0);
  const [markers, setMarkers] = useState<any[] | null>(null);
  const [markersCopy, setMarkersCopy] = useState<any[] | null>(null);
  const [overlayIndex, setOverlayIndex] = useState<number>(-1);
  const [markerFilter, setMarkerFilter] = useState<string>("ALL");
  const [commentModalPost, setCommentModalPost] = useState<any>(null);
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const history = useHistory();
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [commentModalPostUpvotes, setCommentModalPostUpvotes] =
    useState<number>(-1);
  const [commentModalPostDownvotes, setCommentModalPostDownvotes] =
    useState<number>(-1);
  const [comments, setComments] = useState<any[] | null>(null);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const timeAgo = new TimeAgo("en-US");
  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };

  useIonViewDidEnter(() => {
    // setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      // getSchoolLocation();
      getMapMarkers();
      // setBusy(false);
    }
  }, [user, schoolName]);

  useEffect(() => {
    if (!user) {
      history.replace("/landing-page");
    } else {
      getSchoolLocation();
    }
  }, [user, schoolName])

  const deleteComment = async (index: number) => {
    setCommentsLoading(true);
    if (comments && commentModalPost && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(
        5000,
        removeComment(commentBeingDeleted, schoolName, commentModalPost.key)
      );
      didDelete.then((res) => {
        if (res) {
          Toast.success("Comment deleted");
          if (comments.length == 0) {
            setComments([]);
          } else {
            let tempComments: any[] = [];
            for (let i = 0; i < comments.length; ++i) {
              if (i !== index) {
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
      });
    } else {
      Toast.error("Unable to delete comment");
      setCommentsLoading(false);
    }
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
          if (markers) {
            let tempPosts: any[] = [...markers];
            tempPosts[overlayIndex].commentAmount += 1;
            setMarkers(tempPosts);
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
                  "Post has been deleted"
                );
              } else {
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
  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
  };
  const getMarkerColor = (postType: string) => {
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
  const handleDownVote = async (postKey: string, index: number, post: any) => {
    const val = await downVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (markers && user) {
        let tempPosts: any[] = [...markers];
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
        setMarkers(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
  };
  const handleUpVote = async (postKey: string, index: number, post: any) => {
    const val = await upVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (markers && user) {
        let tempPosts: any[] = [...markers];
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
        setMarkers(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to like post :(");
    }
  };
  const handleCardClick = async () => {
    if (markers && overlayIndex != -1) {
      setCommentModalPostDownvotes(markers[overlayIndex].downVotes);
      setCommentModalPostUpvotes(markers[overlayIndex].upVotes);
      setCommentModalPost(markers[overlayIndex]);
      setCommentsLoading(true);
      setShowModalComment(true);
      try {
        // load comments from /schoolPosts/{schoolName}/comments/{post.key}
        const resComments = await loadComments(
          markers[overlayIndex].key,
          schoolName
        );
        if (resComments != null && resComments != undefined) {
          setComments(resComments);
          setCommentsLoading(false);
        } else {
          //console.log(resComments);
          Toast.error(
            "Post has been deleted"
          );
        }
      } catch (err: any) {
        console.log(err);
        Toast.error(err.message.toString());
      }
    }
  };

  const getDate = (timestamp: any) => {
    const time = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    return timeAgo.format(time);
  };

  const getSchoolLocation = () => {
    if (schoolInfo[schoolName as keyof typeof schoolInfo] !== undefined) {
      const latitude = schoolInfo[schoolName as keyof typeof schoolInfo][0];
      const longitude = schoolInfo[schoolName as keyof typeof schoolInfo][1];
      const schoolZoom = schoolInfo[schoolName as keyof typeof schoolInfo][2];
      setDefaultLat(latitude);
      setDefaultLong(longitude);
      setCenter([latitude, longitude]);
      setZoom(schoolZoom);
      setDefaultZoom(schoolZoom);
    }
  };

  const updateMarkers = (filter: string) => {
    setMarkerFilter(filter);
    if (filter === "ALL") {
      setMarkers(markersCopy);
    } else {
      if (filter == "YOURS") {
        let tempMarkers: any[] = [];
        if (markersCopy && user) {
          for (const marker of markersCopy) {
            if (marker.uid == user.uid) {
              tempMarkers.push(marker);
            }
          }
          setMarkers(tempMarkers);
        } else {
          Toast.error("Unable to filter :(");
        }
      } else {
        if (filter === "BUY/SELL") {
          filter = "buy/Sell";
        } else if (filter === "GENERAL") {
          filter = filter.toLowerCase();
        } else {
          filter = filter.toLowerCase();
          filter = filter.slice(0, -1);
        }
        let tempMarkers: any[] = [];
        if (markersCopy) {
          for (const marker of markersCopy) {
            if (marker.postType == filter) {
              tempMarkers.push(marker);
            }
          }
          setMarkers(tempMarkers);
        } else {
          Toast.error("Unable to filter :(");
        }
      }

    }
  };
  const isEnterPressed = (key: any) => {
    if (key === "Enter") {
      handleCommentSubmit(commentModalPost.key);
    }
  };
  const getMapMarkers = async () => {
    if (schoolName) {
      // setBusy(true);
      const markersRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts"
      );
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      tomorrow.setDate(yesterday.getDate() + 2);
      const q = query(
        markersRef,
        where("marker", "==", true),
        where("timestamp", ">", yesterday),
        where("timestamp", "<", tomorrow),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const tempMarkers: any[] = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        tempMarkers.push({
          ...doc.data(),
          key: doc.id,
        });
      }
      //console.log(tempMarkers);
      setMarkers(tempMarkers);
      setMarkersCopy(tempMarkers);
      // setBusy(false);
    }
  };
  const setDefaultCenter = () => {
    setCenter([defaultLat, defaultLong]);
    setZoom(defaultZoom);
  };
  const handleUserPageNavigation = (uid: string) => {
    history.push("home/about/" + uid);
  };

  return (
    <IonPage>
      <IonContent fullscreen={true}>
        {/* <IonLoading
          spinner="dots"
          message="Loading markers..."
          duration={0}
          isOpen={busy}
        ></IonLoading> */}
        <IonLoading
          spinner="dots"
          message="Adding comment"
          duration={0}
          isOpen={commentsBusy}
        ></IonLoading>

        <div className="overlaySearch">
          <IonLabel> FILTER: </IonLabel>
          <IonSelect
            mode="ios"
            value={markerFilter}
            placeholder="Filter: ALL"
            onIonChange={(e: any) => {
              setOverlayIndex(-1);
              updateMarkers(e.detail.value);
            }}
          >
            <IonSelectOption value="ALL">All</IonSelectOption>
            <IonSelectOption value="YOURS">Yours</IonSelectOption>
            <IonSelectOption value="GENERAL">General</IonSelectOption>
            <IonSelectOption value="ALERTS">Alerts</IonSelectOption>
            <IonSelectOption value="BUY/SELL">Buy/Sell</IonSelectOption>
            <IonSelectOption value="SIGHTINGS">Sightings</IonSelectOption>
            <IonSelectOption value="EVENTS">Events</IonSelectOption>
          </IonSelect>
        </div>

        <IonModal backdropDismiss={false} isOpen={showModalComment}>
          <IonContent>
            <div slot="fixed" style={{ width: "100%" }}>
              <IonToolbar mode="ios">
                <IonButtons slot="start">
                  <IonButton
                    onClick={() => {
                      setShowModalComment(false);
                      setComment("");
                    }}
                  >
                    <IonIcon icon={arrowBack}></IonIcon> Back
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </div>
            <div style={darkModeToggled ? { top: "80vh", height: "20vh", width: "100vw", border: '2px solid #282828', borderRadius: "10px" } : { top: "80vh", height: "20vh", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed" className={darkModeToggled ? "text-area-dark" : "text-area-light"}>
              <IonTextarea
                mode="ios"
                enterkeyhint="enter"
                rows={3}
                style={{ width: "95vw", height: "10vh", marginLeft: "2.5vw" }}
                color="secondary"
                spellcheck={true}
                maxlength={200}
                value={comment}
                inputMode="text"
                placeholder="Leave a comment..."
                id="commentModal"
                onKeyPress={e => isEnterPressed(e.key)}
                onIonChange={(e: any) => {
                  handleChangeComment(e);
                }}
                className={darkModeToggled ? "text-area-dark" : "text-area-light"}
              ></IonTextarea>
            </div>
            <div className="ion-modal">

              {commentModalPost ? (
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
                                handleUserPageNavigation(commentModalPost.uid);
                              }}
                              class="posts-avatar"
                            >
                              <IonImg src={commentModalPost.photoURL}></IonImg>
                            </IonAvatar>
                            {commentModalPost.userName}
                          </p>
                        </IonText>
                        {commentModalPost.postType &&
                          commentModalPost.postType != "general" ? (
                          <IonFab vertical="top" horizontal="end">
                            <p
                              style={{
                                fontWeight: "bold",
                                color: getMarkerColor(
                                  commentModalPost.postType
                                ),
                              }}
                            >
                              {commentModalPost.postType.toUpperCase()}
                            </p>
                            <IonNote style={{ fontSize: "0.85em" }}>
                              {getDate(commentModalPost.timestamp)}
                            </IonNote>
                          </IonFab>
                        ) : (
                          <IonFab style={{ bottom: "1vh" }} horizontal="end">
                            <IonNote style={{ fontSize: "0.85em" }}>
                              {getDate(commentModalPost.timestamp)}
                            </IonNote>
                          </IonFab>
                        )}
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
                          likeAnimation === overlayIndex ? "likeAnimation" : ""
                        }
                        disabled={disabledLikeButtons === overlayIndex}
                        mode="ios"
                        fill="outline"
                        color={
                          overlayIndex != -1 &&
                            user &&
                            markers &&
                            markers[overlayIndex] &&
                            "likes" in markers[overlayIndex] &&
                            markers[overlayIndex].likes[user.uid] == undefined
                            ? "medium"
                            : "primary"
                        }
                        onClick={() => {
                          setLikeAnimation(overlayIndex);
                          setDisabledLikeButtons(overlayIndex);
                          handleUpVote(commentModalPost.key, overlayIndex, commentModalPost);
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
                          dislikeAnimation === overlayIndex
                            ? "likeAnimation"
                            : ""
                        }
                        disabled={disabledLikeButtons === overlayIndex}
                        mode="ios"
                        fill="outline"
                        color={
                          overlayIndex != -1 &&
                            user &&
                            markers &&
                            markers[overlayIndex] &&
                            "dislikes" in markers[overlayIndex] &&
                            markers[overlayIndex].dislikes[user.uid] == undefined
                            ? "medium"
                            : "danger"
                        }
                        onClick={() => {
                          setDislikeAnimation(overlayIndex);
                          setDisabledLikeButtons(overlayIndex);
                          handleDownVote(commentModalPost.key, overlayIndex, commentModalPost);
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
              ) : null}

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
                                    <IonImg src={comment?.photoURL!}></IonImg>
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
                              disabled
                              mode="ios"
                              fill="outline"
                              color="medium"
                            >
                              <KeyboardArrowUpIcon />
                              <p>{comment.upVotes} </p>
                            </IonButton>
                            <IonButton
                              disabled
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
                                  onClick={() => {
                                    deleteComment(index);
                                  }}
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
              <div style={{ height: "25vh" }}>
                <p style={{ textAlign: "center" }}>&#183; </p>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <Map
          center={center}
          zoom={zoom}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          onClick={() => {
            setOverlayIndex(-1);
          }}
        >
          <ZoomControl style={{left:"85%", top:"50%"}} buttonStyle={{color: "#61dbfb"}}/>

          {markers
            ? markers.map((marker, index) => {
              return (
                <Marker
                  style={{ opacity: "90%" }}
                  onClick={(e) => {
                    setCenter([
                      marker.location[0],
                      marker.location[1],
                    ]);
                    setOverlayIndex(-1);
                    setOverlayIndex(index);
                  }}
                  color={getMarkerColor(marker.postType)}
                  key={marker.key}
                  anchor={[marker.location[0], marker.location[1]]}
                  width={50}
                />
              );
            })
            : null}
          {markers && overlayIndex != -1 ? (
            <Overlay
              anchor={[
                markers[overlayIndex].location[0],
                markers[overlayIndex].location[1],
              ]}
              offset={[110, 25]}
            >
              <IonCard
                onClick={() => {
                  handleCardClick();
                }}
                style={{ width: "55vw", opacity: "90%" }}
                mode="ios"
              >
                <IonCardContent>
                  <IonCardTitle style={{ fontSize: "medium" }} mode="ios">
                    {markers[overlayIndex].userName}
                  </IonCardTitle>
                  <IonFab horizontal="end" vertical="top">
                    <p
                      style={{
                        fontWeight: "bold",
                        fontSize: "2.5vw",
                        color: getMarkerColor(markers[overlayIndex].postType),
                      }}
                    >
                      {markers[overlayIndex].postType.toUpperCase()}
                    </p>
                  </IonFab>
                  <p>
                    {markers[overlayIndex].message.length > 140
                      ? markers[overlayIndex].message.substring(0, 140) + "..."
                      : markers[overlayIndex].message}
                  </p>
                  {markers[overlayIndex].imgSrc &&
                    markers[overlayIndex].imgSrc.length > 0 ? (
                    <IonImg
                      class="ion-img-container"
                      src={markers[overlayIndex].imgSrc}
                    />
                  ) : null}
                </IonCardContent>
                <br></br>
                <br></br>
                <br></br>
                <IonFab vertical="bottom">
                  <IonRow>
                    <IonCol size="4">
                      <IonButton
                        disabled={true}
                        style={{ width: "16vw" }}
                        mode="ios"
                        fill="outline"
                        color={
                          overlayIndex != -1 &&
                            markers &&
                            markers[overlayIndex] &&
                            "likes" in markers[overlayIndex] &&
                            user &&
                            markers[overlayIndex].likes[user.uid] !== undefined
                            ? "primary"
                            : "medium"
                        }
                      >
                        <KeyboardArrowUpIcon />
                        <p>{markers[overlayIndex].upVotes} </p>
                      </IonButton>
                    </IonCol>
                    <IonCol size="4">
                      <IonButton
                        disabled={true}
                        style={{ width: "16vw" }}
                        mode="ios"
                        color="medium"
                      >
                        <ForumIcon />
                        <p>{markers[overlayIndex].commentAmount} </p>
                      </IonButton>
                    </IonCol>
                    <IonCol size="4">
                      <IonButton
                        disabled={true}
                        style={{ width: "16vw" }}
                        mode="ios"
                        fill="outline"
                        // onClick={() => {
                        //   setDislikeAnimation(markers[overlayIndex].key);
                        //   setDisabledLikeButtons(overlayIndex);
                        //   handleDownVote(
                        //     markers[overlayIndex].key,
                        //     overlayIndex
                        //   );
                        //}}
                        color={
                          markers &&
                            overlayIndex != -1 &&
                            user &&
                            "dislikes" in markers[overlayIndex] &&
                            markers[overlayIndex].dislikes[user.uid] !== undefined
                            ? "danger"
                            : "medium"
                        }
                      >
                        <KeyboardArrowDownIcon />
                        <p>{markers[overlayIndex].downVotes} </p>
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonFab>
              </IonCard>
            </Overlay>
          ) : null}
          <IonFab horizontal="start" vertical="bottom" >
            <p style={{ fontSize: "1em", color: "black", fontWeight: "bold" }}>{schoolName}</p>
          </IonFab>
          <IonFab horizontal="end" vertical="bottom">
            <IonButton color="light" onClick={setDefaultCenter} mode="ios">
              <IonIcon icon={schoolOutline} />
            </IonButton>
          </IonFab>
        </Map>
      </IonContent>
    </IonPage>
  );
}

export default React.memo(Maps);
