import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { promiseTimeout, getPostTypeDb } from '../fbConfig';
import { useToast } from "@agney/ir-toast";
import RoomIcon from '@mui/icons-material/Room';
import {
  IonAvatar,
  IonCol,
  IonContent, IonFab,
  IonItem, IonLabel, IonList,
  IonNote, IonPage,
  IonRow,
  IonSpinner, IonText, useIonRouter
} from "@ionic/react";
import FadeIn from "react-fade-in/lib/FadeIn";
import "../App.css";
import Linkify from 'linkify-react';
import { Virtuoso } from "react-virtuoso";
import { useContext } from "../my-context";
import ProfilePhoto from "../components/Shared/ProfilePhoto";
import { getColor } from "../helpers/getColor";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import { getDate } from "../helpers/timeago";
import { Toolbar } from "../components/Shared/Toolbar";
import { dynamicNavigate } from "../components/Shared/Navigation";

interface MatchUserPostParams {
  type: string;
  schoolName: string;
}

const Posttypes = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  let postType = match.params.type;
  if (postType === "buySell") {
    postType = "buy/Sell";
  }
  const schoolName = match.params.schoolName;
  const context = useContext();
  const [user] = useAuthState(auth);
  const Toast = useToast();
  const [posts, setPosts] = useState<any[]>();
  const router = useIonRouter();

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
          const toast = Toast.create({ message: 'Something went wrong within this class', duration: 2000, color: 'toast-error' });
          toast.present();
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

  const Footer = () => {
    return (
      <>
        <br></br> <br></br>
      </>
    )
  }

  return (
    <IonPage>
      <Toolbar title={postType === "buy" ? "BUY/SELL POSTS" : postType.toUpperCase() + " POSTS"} />
      <IonContent fullscreen scrollY={false}>
        <Virtuoso
          className="ion-content-scroll-host"
          data={posts}
          style={{ height: "100%" }}
          itemContent={(item: number) => {
            if (posts && posts.length > 0) {
              let post = posts[item];
              return (
                <FadeIn key={post}>
                  <IonList inset={true} mode="ios">
                    <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate(router, "/post/" + schoolName + "/" + post.userName + "/" + post.key, 'forward') }}>
                      <IonLabel class="ion-text-wrap">
                        <IonRow>
                          <FadeIn>
                            <IonAvatar onClick={(e) => { e.stopPropagation(); dynamicNavigate(router, '/about/' + schoolName + "/" + post.uid, 'forward'); }} class="posts-avatar">
                              <ProfilePhoto uid={post.uid}></ProfilePhoto>
                            </IonAvatar>
                          </FadeIn>
                          <p style={{ color: context.darkMode ? "var(--ion-color-light)" : "var(--ion-color-black)", padding: "10px", fontWeight: 'bold' }}>{post.userName}</p>
                        </IonRow>
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
                                {post.marker && "POI" in post && post.POI.length > 0 ? (
                                  <RoomIcon
                                    style={{ fontSize: "1em" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dynamicNavigate(router, "/markerInfo/" + schoolName + "/" + post.POI, 'forward');
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
                                {post.marker && "POI" in post && post.POI.length > 0 ? (
                                  <RoomIcon onClick={(e) => {
                                    e.stopPropagation();
                                    dynamicNavigate(router, "/markerInfo/" + schoolName + "/" + post.POI, 'forward');
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
                          <Linkify tagName="h3" className={context.darkMode ? "h2-message" : "h2-message-light"}>
                            {post.message}
                            <IonNote
                              color="medium"
                              style={{ fontWeight: "400" }}
                            >
                              &nbsp; — {post.className}{post.classNumber}
                            </IonNote>
                          </Linkify>
                          :
                          <Linkify tagName="h3" className={context.darkMode ? "h2-message" : "h2-message-light"}>
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
                                  const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                  toast.present();
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
                                      const toast = Toast.create({ message: 'Unable to open image on wen version', duration: 2000, color: 'toast-error' });
                                      toast.present();
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
                                      const toast = Toast.create({ message: 'Unable to open image on web version', duration: 2000, color: 'toast-error' });
                                      toast.present();
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
                                      const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                      toast.present();
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
                                      const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                      toast.present();
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
                                    const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                                    toast.present();
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
              );
            } else if (posts && posts.length == 0) {
              return (
                <div className="ion-spinner">
                  <p style={{ textAlign: "center", }}>No posts matching post type...</p>
                </div>
              );
            }
            return (
              <div className="ion-spinner">
                <IonSpinner
                  color={
                    schoolName === "Cal Poly Humboldt"
                      && context.schoolColorToggled
                      ? "tertiary"
                      : "primary"
                  }
                />
              </div>
            );
          }}
          components={{ Footer }}
        />
      </IonContent>
    </IonPage>
  )

};

export default Posttypes;