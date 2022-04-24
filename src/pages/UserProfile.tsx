import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  auth,
  getUserPosts,
  getNextBatchUserPosts,
  getUserData,
  storage,
} from "../fbconfig";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFab,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import FadeIn from "react-fade-in";
import { ionHeaderStyle } from "./Header";
import { ref, getDownloadURL } from "firebase/storage";
import { timeout } from "workbox-core/_private";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import "../App.css";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'

TimeAgo.addDefaultLocale(en)

interface MatchParams {
  uid: string;
}

export const UserProfile = ({ match }: RouteComponentProps<MatchParams>) => {
  const uid = match.params.uid;
  const timeAgo = new TimeAgo('en-US')
  const [busy, setBusy] = useState<boolean>(false);
  const [noPostsYet, setNoPostsYet] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const history = useHistory();
  const [schoolName, setSchoolName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [lastKey, setLastKey] = useState<any>();
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);
  const Toast = useToast();
  const titleStyle = {
    fontSize: "6.5vw",
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
  const getDate = (timestamp: any) => {
    const time = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    return timeAgo.format(time);
  };
  const fetchMorePosts = () => {
    if (lastKey) {
      getNextBatchUserPosts(schoolName, uid, lastKey)
        .then((res: any) => {
          setLastKey(res.lastKey);
          setUserPosts(userPosts.concat(res.userPosts));
          if (res.userPosts.length == 0) {
            setNoMorePosts(true);
          }
        })
        .catch((err) => {
          Toast.error(err.message.toString());
        });
    } else {
      setNoMorePosts(true);
    }
  };
  function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }
  useEffect(() => {
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (uid) {
        getUserData(uid)
          .then((res: any) => {
            setUsername(res[0].userName);
            setSchoolName(res[0].school);
            getUserPosts(res[0].school, uid)
              .then((res: any) => {
                // first batch
                if (res.userPosts.length > 0) {
                  //   for (let doc of res.userPosts) {
                  //     if (doc.url && doc.url.length > 0) {
                  //       getDownloadURL(ref(storage, doc.url)).then((url) => {
                  //         doc.imgSrc = url;
                  //       });
                  //     }
                  //     }
                  console.log(res.userPosts);
                  setUserPosts(res.userPosts);
                  setLastKey(res.lastKey);
                } else {
                  setNoPostsYet(true);
                }
              })
              .catch((err) => {
                Toast.error(err.message.toString());
              });
            console.log();
            getDownloadURL(ref(storage, "profilePictures/" + uid + "photoURL"))
              .then((url) => {
                setProfilePhoto(url);
                setBusy(false);
              })
              .catch((err) => {
                if (err.code === "storage/object-not-found") {
                  getDownloadURL(
                    ref(
                      storage,
                      "profilePictures/301-3012952_this-free-clipart-png-design-of-blank-avatar.png"
                    )
                  )
                    .then((url) => {
                      setProfilePhoto(url);
                      setBusy(false);
                    })
                    .catch((err) => {
                      Toast.error(err.message.toString());
                    });
                } else {
                  Toast.error(err.message.toString());
                }
              });
          })
          .catch((err) => {
            Toast.error(err.message.toString());
          });
      }
    }
  }, [user, uid]);

  if (!noPostsYet) {
    return (
      <React.Fragment>
        <IonContent>
          <IonHeader style={ionHeaderStyle} mode="ios">
            <IonToolbar mode="ios">
              <IonButtons slot="start">
                <IonBackButton mode="ios" defaultHref="/home" />
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <FadeIn>
            <IonCard>
              <IonCardContent>
                {busy ? (
                  <div>
                    <IonAvatar className="user-avatar">
                      <IonLabel>
                        <IonSkeletonText animated={true} />
                      </IonLabel>
                    </IonAvatar>
                    <IonFab vertical="center">
                      <IonLabel>
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "50vw", height: "1.75em" }}
                        />
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "50vw" }}
                        />
                      </IonLabel>
                    </IonFab>
                  </div>
                ) : (
                  <div>
                    <IonAvatar className="user-avatar">
                      <IonImg src={profilePhoto} />
                    </IonAvatar>
                    <IonFab vertical="center">
                      <p style={{ fontSize: "1.5em" }}>{username}</p>
                      <IonNote style={{ fontSize: "1em" }}>
                        {schoolName}
                      </IonNote>
                    </IonFab>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
            <div style={{ textAlign: "center", alignItems: "center" }}>
              <IonLabel>Posts</IonLabel>
            </div>
          </FadeIn>

          <div>
            <>
              {userPosts && userPosts.length > 0
                ? userPosts.map((post: any) => {
                    return (
                      <FadeIn key={post.key}>
                        <IonList inset={true} mode="ios">
                          <IonItem lines="none" mode="ios">
                            <IonLabel>
                              <IonFab horizontal="end">
                                <IonNote style={{fontSize: "0.75em"}}> {getDate(post.timestamp)} </IonNote>
                              </IonFab>
                              <IonFab horizontal="start">
                              <p
                                  style={{
                                    fontWeight: "bold",
                                    color: getColor(post.postType),
                                  }}
                                >
                                  {post.postType.toUpperCase()}
                                </p>
                              </IonFab>
                              <br></br>
                              <h3
                                className="h2-message"
                                style={{ marginLeft: "2.5%", marginTop: "5%" }}
                              >
                                {" "}
                                {post.message}{" "}
                              </h3>

                              {post.imgSrc && post.imgSrc.length > 0 ? (
                                <div>
                                  <br></br>
                                  <br></br>
                                  <IonImg
                                    className="ion-img-container"
                                    onClick={() => {
                                      PhotoViewer.show(post.imgSrc);
                                    }}
                                    src={post.imgSrc}
                                  />
                                </div>
                              ) : null}
                            </IonLabel>
                          </IonItem>
                        </IonList>
                      </FadeIn>
                    );
                  })
                : null}
            </>
            <FadeIn>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <IonButton
                  color="medium"
                  mode="ios"
                  fill="outline"
                  expand="block"
                  disabled={noMorePosts}
                  onClick={() => {
                    fetchMorePosts();
                  }}
                >
                  LOAD MORE POSTS{" "}
                </IonButton>
              </div>
            </FadeIn>
          </div>
        </IonContent>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <IonContent>
          <IonHeader style={ionHeaderStyle} mode="ios">
            <IonToolbar mode="ios">
              <IonButtons slot="start">
                <IonBackButton mode="ios" defaultHref="/home" />
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <FadeIn>
            <IonCard>
              <IonCardContent>
                <IonAvatar className="user-avatar">
                  <IonImg src={profilePhoto} />
                </IonAvatar>
                <IonFab vertical="center">
                  <p style={{ fontSize: "1.5em" }}>{username}</p>
                  <IonNote style={{ fontSize: "1em" }}>{schoolName}</IonNote>
                </IonFab>
              </IonCardContent>
            </IonCard>
            <div style={{ textAlign: "center", alignItems: "center" }}>
              <IonLabel>NO POSTS YET</IonLabel>
            </div>
          </FadeIn>
        </IonContent>
      </React.Fragment>
    );
  }
};
