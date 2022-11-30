import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getPostTypeDb } from '../fbconfig';
import { promiseTimeout } from "../fbconfig";
import { useToast } from "@agney/ir-toast";
import RoomIcon from '@mui/icons-material/Room';
import {
  IonAvatar, IonButton, IonButtons,
  IonContent, IonFab, IonIcon,
  IonItem, IonLabel, IonList,
  IonNote, IonPage, 
  IonSpinner, IonText,
  IonTitle, IonToolbar, RouterDirection, useIonRouter
} from "@ionic/react";
import FadeIn from "react-fade-in";
import "../App.css";
import TimeAgo from "javascript-time-ago";
import { chevronBackOutline } from "ionicons/icons";
import { getColor } from '../shared/functions';
import Linkify from 'linkify-react';
import ProfilePhoto from "./ProfilePhoto";
import { Virtuoso } from "react-virtuoso";
import PostImages from "./PostImages";

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
  const [posts, setPosts] = useState<any[]>();
  const sensitiveToggled = useSelector((state: any) => state.sensitive.sensitiveContent);
  const timeAgo = new TimeAgo("en-US");
  
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

  const Footer = () => {
    return (
      <>
        <br></br> <br></br>
      </>
    )
  }

  return (
    <IonPage className="ion-page-ios-notch">
      <IonContent fullscreen scrollY={false}>

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

        <br /> <br />


        <Virtuoso
          className="ion-content-scroll-host"
          data={posts}
          style={{ height: "100%" }}
          itemContent={(item: number) => {
            if (posts && posts.length > 0) {
              let post = posts[item];
              return (
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

                        <PostImages post={post} isSensitive={sensitiveToggled} />

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
                      && schoolColorToggled
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