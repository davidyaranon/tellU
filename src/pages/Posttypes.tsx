import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import auth,
{
  addCommentNew, downVoteComment, getClassPostsDb, getLikes, getPostTypeDb,
} from '../fbconfig';
import { promiseTimeout } from "../fbconfig";
import { useToast } from "@agney/ir-toast";
import RoomIcon from '@mui/icons-material/Room';
import {
  IonAvatar, IonButton, IonButtons, IonCard,
  IonCardContent, IonCol, IonContent, IonFab,
  IonFabButton, IonGrid, IonHeader, IonIcon,
  IonItem, IonLabel, IonList, IonModal,
  IonNote, IonPage, IonRow, IonSelect, IonSelectOption, IonSkeletonText,
  IonSpinner, IonText, IonTextarea,
  IonTitle, IonToolbar, RouterDirection, useIonRouter
} from "@ionic/react";
import FadeIn from "react-fade-in";
import "../App.css";
import TimeAgo from "javascript-time-ago";
import { cameraOutline, shareOutline, chevronBackOutline, alertCircleOutline } from "ionicons/icons";
import { getColor, timeout } from '../components/functions';
import Linkify from 'linkify-react';
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import ProfilePhoto from "./ProfilePhoto";

interface MatchUserPostParams {
  type: string;
}


const Posttypes = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const postType = match.params.type;
  const [user] = useAuthState(auth);
  const Toast = useToast();
  const router = useIonRouter();
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const schoolName = useSelector((state: any) => state.user.school);
  const timeAgo = new TimeAgo("en-US");
  const [posts, setPosts] = useState<any[]>();

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

  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }
  const navigateBack = () => {
    if (router.canGoBack()) {
      router.goBack();
    } else {
      dynamicNavigate('home', 'back');
    }
  }

  const getPosts = async () => {
    if (postType) {
      let postName = postType;
      if (postType === "buy") {
        postName = "buy/Sell";
      }
      const classPosts = promiseTimeout(15000, getPostTypeDb(postName, schoolName));
      classPosts.then((posts) => {
        if (posts) {
          setPosts(posts);
        } else {
          Toast.error("Something went wrong within this class");
        }
      });
      classPosts.catch((err) => {
        Toast.error(err);
      });
    }
  }

  useEffect(() => {
    if (user && schoolName) {
      getPosts();
    } else {
      if (!user) {
        console.log("user not a thing");
      }
      if (!schoolName) {
        console.log("no school name");
      }
    }
  }, [match.params.type, schoolName, user])

  return (
    <IonPage>
      <IonContent scrollEvents>

        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios">
            {postType && postType === "buy" &&
              <IonTitle>Last 50 {postType.toUpperCase()}/SELLS</IonTitle>
            }
            {postType && postType !== "research" && postType !== "buy" &&
              <IonTitle>Last 50 {postType.toUpperCase()}S</IonTitle>
            }
            {postType && postType === "research" &&
              <IonTitle>Last 50 {postType.toUpperCase()} Posts</IonTitle>
            }
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonButton
                color={
                  schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"
                }
                onClick={() => {
                  navigateBack();
                }}
              >
                <IonIcon icon={chevronBackOutline}></IonIcon> Back
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>

        <div className="ion-modal">
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
                              dynamicNavigate('about/' + post.uid, 'forward');
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
                      {"className" in post && "classNumber" in post && post.className.length > 0 ?
                        <Linkify tagName="h3" className="h2-message">
                          {post.message}
                          <IonNote
                            color="medium"
                            style={{ fontWeight: "400" }}
                          >
                            &nbsp; — {post.className}{post.classNumber}
                          </IonNote>
                        </Linkify>
                        :
                        <Linkify tagName="h3" className="h2-message">
                          {post.message}
                        </Linkify>
                      }

                      {"imgSrc" in post && post.imgSrc &&
                        post.imgSrc.length == 1 &&
                        <>
                          <div style={{ height: "0.75vh" }}>{" "}</div>
                          <div
                            className="ion-img-container"
                            style={{ backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const img: CapacitorImage = {
                                url: post.imgSrc[0],
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
                            }}
                          >
                          </div>
                        </>
                      }
                      {"imgSrc" in post && post.imgSrc &&
                        post.imgSrc.length == 2 ? (
                        <>
                          <div style={{ height: "0.75vh" }}>{" "}</div>
                          <IonRow>
                            <IonCol>
                              <div
                                className="ion-img-container"
                                style={{ backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const img: CapacitorImage[] = [
                                    {
                                      url: post.imgSrc[0],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[1],
                                      title: `${post.userName}'s post`
                                    },
                                  ]
                                  CapacitorPhotoViewer.show({
                                    images: img,
                                    mode: 'slider',
                                    options: {
                                      title: true,
                                    },
                                    startFrom: 0,
                                  }).catch((err) => {
                                    Toast.error('Unable to open image on web version');
                                  });
                                }}
                              >
                              </div>
                            </IonCol>
                            <IonCol>
                              <div
                                className="ion-img-container"
                                style={{ backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const img: CapacitorImage[] = [
                                    {
                                      url: post.imgSrc[0],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[1],
                                      title: `${post.userName}'s post`
                                    },
                                  ]
                                  CapacitorPhotoViewer.show({
                                    images: img,
                                    mode: 'slider',
                                    options: {
                                      title: true
                                    },
                                    startFrom: 1,
                                  }).catch((err) => {
                                    Toast.error('Unable to open image on web version');
                                  });
                                }}
                              >
                              </div>
                            </IonCol>
                          </IonRow>
                        </>
                      ) : null}
                      {"imgSrc" in post && post.imgSrc &&
                        post.imgSrc.length >= 3 ? (
                        <>
                          <div style={{ height: "0.75vh" }}>{" "}</div>
                          <IonRow>
                            <IonCol>
                              <div
                                className="ion-img-container"
                                style={{ backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const img: CapacitorImage[] = [
                                    {
                                      url: post.imgSrc[0],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[1],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[2],
                                      title: `${post.userName}'s post`
                                    },
                                  ]
                                  CapacitorPhotoViewer.show({
                                    images: img,
                                    mode: 'slider',
                                    options: {
                                      title: true
                                    },
                                    startFrom: 0,
                                  }).catch((err) => {
                                    Toast.error('Unable to open image on web version');
                                  });
                                }}
                              >
                              </div>
                            </IonCol>
                            <IonCol>
                              <div
                                className="ion-img-container"
                                style={{ backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const img: CapacitorImage[] = [
                                    {
                                      url: post.imgSrc[0],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[1],
                                      title: `${post.userName}'s post`
                                    },
                                    {
                                      url: post.imgSrc[2],
                                      title: `${post.userName}'s post`
                                    },
                                  ]
                                  CapacitorPhotoViewer.show({
                                    images: img,
                                    mode: 'slider',
                                    options: {
                                      title: true
                                    },
                                    startFrom: 1,
                                  }).catch((err) => {
                                    Toast.error('Unable to open image on web version');
                                  });
                                }}
                              >
                              </div>
                            </IonCol>
                          </IonRow>
                          <>
                            <div style={{ height: "0.75vh" }}>{" "}</div>
                            <div
                              className="ion-img-container"
                              style={{ backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '20px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const img: CapacitorImage[] = [
                                  {
                                    url: post.imgSrc[0],
                                    title: `${post.userName}'s post`
                                  },
                                  {
                                    url: post.imgSrc[1],
                                    title: `${post.userName}'s post`
                                  },
                                  {
                                    url: post.imgSrc[2],
                                    title: `${post.userName}'s post`
                                  },
                                ]
                                CapacitorPhotoViewer.show({
                                  images: img,
                                  mode: 'slider',
                                  options: {
                                    title: true
                                  },
                                  startFrom: 2,
                                }).catch((err) => {
                                  Toast.error('Unable to open image on web version');
                                });
                              }}
                            >
                            </div>
                          </>
                        </>
                      ) : null}
                    </IonLabel>
                  </IonItem>
                </IonList>
              </FadeIn>
            ))
          )
            : posts && posts.length == 0 ?
              <div className="ion-spinner">
                <p style={{ textAlign: "center", }}>No posts matching post type...</p>

              </div>
              : (
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
              )}
        </div>

      </IonContent>
    </IonPage>
  )

};

export default Posttypes;