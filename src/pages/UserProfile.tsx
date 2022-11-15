/* Ionic + React */
import FadeIn from "react-fade-in";
import Linkify from 'linkify-react';
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import {
  IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonCol,
  IonContent, IonFab, IonIcon, IonImg, IonInfiniteScroll, IonInfiniteScrollContent,
  IonItem, IonLabel, IonList, IonNote, IonPage, IonRow, IonSkeletonText,
  IonText, IonToolbar, RouterDirection, useIonRouter
} from "@ionic/react";
import {
  chatbubbleOutline,
  chevronBackOutline, logoInstagram,
  logoSnapchat, logoTiktok, shareOutline
} from "ionicons/icons";

/* Firebase */
import auth,
{
  getLikes, getUserPosts, getNextBatchUserPosts,
  getUserData, storage, upVote, downVote
}
  from '../fbconfig';
import { ref, getDownloadURL } from "firebase/storage";
import { getDatabase, goOffline, goOnline } from "firebase/database";

/* mui Icons */
import RoomIcon from '@mui/icons-material/Room';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from '@mui/icons-material/Forum';

/* Capacitor */
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';

/* CSS + Other Components */
import "../App.css";
import TimeAgo from "javascript-time-ago";
import { useToast } from "@agney/ir-toast";
import { getColor, timeout } from '../components/functions';
import { Virtuoso } from "react-virtuoso";
import PostImages from "./PostImages";

interface MatchParams {
  uid: string;
}

export const UserProfile = ({ match }: RouteComponentProps<MatchParams>) => {
  const uid = match.params.uid;
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const timeAgo = new TimeAgo("en-US");
  const [busy, setBusy] = useState<boolean>(false);
  const [noPostsYet, setNoPostsYet] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const history = useHistory();
  const schoolName = useSelector((state: any) => state.user.school);
  const [username, setUsername] = useState<string>("");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [lastKey, setLastKey] = useState<any>();
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [userBio, setUserBio] = useState<string>("");
  const [userMajor, setUserMajor] = useState<string>("");
  const [userTiktok, setUserTiktok] = useState<string>("");
  const [userSnapchat, setUserSnapchat] = useState<string>("");
  const [userInstagram, setUserInstagram] = useState<string>("");
  const [spotifyUri, setSpotifyUri] = useState<string>("");
  const [iFrameLoader, setIframeLoader] = useState<boolean>(false);
  const sensitiveToggled = useSelector((state: any) => state.sensitive.sensitiveContent);
  const Toast = useToast();
  const router = useIonRouter();
  const db = getDatabase();

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

  const sharePost = async () => {
    await Share.share({
      title: username + "'s tellU Profile",
      text: 'Check them out!',
      url: "http://tellUapp.com/about/" + uid,
    });
  }

  const handleUpVote = async (postKey: string, index: number, post: any) => {
    const val = await upVote(postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
        if (tempPosts[index].likes[user.uid]) {
          delete tempPosts[index].likes[user.uid];
        } else {
          if (tempPosts[index].dislikes[user.uid]) {
            delete tempPosts[index].dislikes[user.uid];
          }
          tempPosts[index].likes[user.uid] = true;
        }
        setUserPosts(tempPosts);
        await timeout(100).then(() => {
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
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
        if (tempPosts[index].dislikes[user.uid]) {
          delete tempPosts[index].dislikes[user.uid];
        } else {
          if (tempPosts[index].likes[user.uid]) {
            delete tempPosts[index].likes[user.uid];
          }
          tempPosts[index].dislikes[user.uid] = true;
        }
        setUserPosts(tempPosts);
        await timeout(100).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
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
    }
    return '';
  };

  const fetchMorePosts = () => {
    console.log("fetching more posts");
    if (lastKey) {
      getNextBatchUserPosts(schoolName, uid, lastKey)
        .then(async (res: any) => {
          setLastKey(res.lastKey);
          for (let i = 0; i < res.userPosts.length; ++i) {
            const data = await getLikes(res.userPosts[i].key);
            if (data) {
              res.userPosts[i].likes = data.likes;
              res.userPosts[i].dislikes = data.dislikes;
              res.userPosts[i].commentAmount = data.commentAmount;
            } else {
              res.userPosts[i].likes = {};
              res.userPosts[i].dislikes = {};
              res.userPosts[i].commentAmount = 0;
            }
          }
          setUserPosts(userPosts.concat(res.userPosts));
          // event.target.complete();
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

  useEffect(() => {
    goOffline(db);
    goOnline(db);
    setUserPosts([]);
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (uid && schoolName) {
        getUserData(uid)
          .then((res: any) => {
            setUsername(res.userName);
            setUserBio(res.bio);
            setUserMajor(res.major);
            setUserInstagram(res.instagram);
            setUserSnapchat(res.snapchat);
            setUserTiktok(res.tiktok);
            if ("spotify" in res) {
              setSpotifyUri(res.spotify);
              // console.log(res.spotify);
            }
            getUserPosts(schoolName, uid)
              .then(async (res: any) => {
                // first batch
                if (res.userPosts.length > 0) {
                  for (let i = 0; i < res.userPosts.length; ++i) {
                    const data = await getLikes(res.userPosts[i].key);
                    if (data) {
                      res.userPosts[i].likes = data.likes;
                      res.userPosts[i].dislikes = data.dislikes;
                      res.userPosts[i].commentAmount = data.commentAmount;
                    } else {
                      res.userPosts[i].likes = {};
                      res.userPosts[i].dislikes = {};
                      res.userPosts[i].commentAmount = 0;
                    }
                  }
                  setUserPosts(res.userPosts);
                  setLastKey(res.lastKey);
                  setNoPostsYet(false);
                } else {
                  setNoPostsYet(true);
                }
              })
              .catch((err) => {
                Toast.error(err.message.toString());
              });
            //console.log();
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
  }, [user, uid, schoolName, match.params.uid]);

  const Header = () => {
    return (
      <>
        <br /> <br />
        <FadeIn>
          <IonCard mode="ios">
            <IonCardContent>
              {busy ? (
                <div>
                  <IonRow>
                    <IonAvatar className="user-avatar">
                      <IonLabel>
                        <IonSkeletonText animated={true} />
                      </IonLabel>
                    </IonAvatar>
                    {/* <IonFab vertical="center" style={{ marginLeft: "5vw"}}> */}
                    <IonLabel>
                      <IonSkeletonText
                        animated={true}
                        style={{ width: "50vw", height: "1.75em", marginLeft: "5vw", bottom: "-1.9vh" }}
                      />
                      <IonSkeletonText
                        animated={true}
                        style={{ width: "50vw", marginLeft: "5vw", bottom: "-1.9vh" }}
                      />
                    </IonLabel>
                    {/* </IonFab> */}
                  </IonRow>
                  <div style={{ height: "5vh" }}></div>
                  <IonFab vertical="bottom" horizontal="start">
                    <IonSkeletonText style={{ width: "75vw", marginLeft: "5vw" }} animated />
                    <IonSkeletonText style={{ width: "75vw", marginLeft: "5vw" }} animated />
                    <IonSkeletonText style={{ width: "75vw", marginLeft: "5vw" }} animated />
                  </IonFab>
                </div>
              ) : (
                <>
                  <div>
                    <IonRow class="ion-justify-content-start">
                      <IonCol size="4">
                        <IonAvatar className="user-avatar">
                          <IonImg onClick={() => {
                            const img: CapacitorImage = {
                              url: profilePhoto,
                              title: username
                            };
                            CapacitorPhotoViewer.show({
                              options: {
                                title: true
                              },
                              images: [img],
                              mode: 'one',
                            }).catch((err) => {
                              Toast.error('Unable to open image on web version');
                            });
                            // PhotoViewer.show(profilePhoto, username);
                          }}
                            src={profilePhoto} />
                        </IonAvatar>
                      </IonCol>
                      {userMajor && userMajor.length > 0 ? (
                        <IonCol class="ion-padding-top" size="8">
                          <p style={{ fontSize: "1.5em" }}>{username}</p>
                          <IonNote style={{ fontSize: "1em" }}>
                            {userMajor}
                          </IonNote>
                        </IonCol>
                      ) : <IonCol class="ion-padding-top" size="8">
                        <p className="ion-padding-top" style={{ fontSize: "1.5em" }}> {username}</p>
                      </IonCol>}
                    </IonRow>
                    {userSnapchat && userSnapchat.length > 0 ? (
                      <>
                        <IonCol size="12">
                          <IonText style={{ fontSize: "0.75em" }}>
                            <IonIcon style={{}} icon={logoSnapchat} />
                            {'\u00A0'}
                            {userSnapchat}
                          </IonText>
                        </IonCol>
                      </>
                    ) : null}
                    {userInstagram && userInstagram.length > 0 ? (
                      <>
                        <IonCol size="12">
                          <IonText onClick={() => { window.open("https://instagram.com/" + userInstagram); }} style={{ fontSize: "0.75em" }}>
                            <IonIcon style={{}} icon={logoInstagram} />
                            {'\u00A0'}
                            {userInstagram}
                          </IonText>
                        </IonCol>
                      </>
                    ) : null}
                    {userTiktok && userTiktok.length > 0 ? (
                      <>
                        <IonCol size="12">
                          <IonText onClick={() => { window.open('https://www.tiktok.com/@' + userTiktok + '?lang=en'); }} style={{ fontSize: "0.75em" }}>
                            <IonIcon style={{}} icon={logoTiktok} />
                            {'\u00A0'}
                            {userTiktok}
                          </IonText>
                        </IonCol>
                      </>
                    ) : null}
                    {userTiktok && userSnapchat && userInstagram && (userTiktok.length > 0 || userSnapchat.length > 0 || userInstagram.length > 0) ? (
                      <>
                        <br />
                      </>
                    ) : null}
                    {userBio && userBio.length > 0 ? (
                      <>
                        <br />
                        <IonRow class="ion-justify-content-start">
                          <p style={{ fontSize: "1em", marginLeft: "2%" }}>{userBio}</p>
                        </IonRow>
                      </>
                    ) : null}
                    {spotifyUri &&
                      <FadeIn delay={250} transitionDuration={750}>
                        <br />
                        {darkModeToggled ?
                          <iframe
                            id="iframe1"
                            title="darkmode_iframe_spotify"
                            style={iFrameLoader ? { width: "82.5vw", backgroundColor: "#2f2f2f", borderRadius: "15px", maxHeight: "80px", opacity: 0, colorScheme: "normal" } : { width: "82.5vw", backgroundColor: "#2f2f2f", borderRadius: "15px", maxHeight: "80px", opacity: 100, colorScheme: "normal" }}
                            className='Music'
                            onLoad={() => { setIframeLoader(false); }}
                            src={"https://embed.spotify.com/?uri=" + spotifyUri} frameBorder="0" allow="autoplay; clipboard-write; fullscreen; picture-in-picture "
                            seamless={true}
                            loading="eager"
                          >
                          </iframe>
                          :
                          <iframe
                            id="iframetwo"
                            title="lightmode_iframe_spotify"
                            style={iFrameLoader ? { width: "82.5vw", backgroundColor: "#f2f1f1", borderRadius: "15px", maxHeight: "80px", opacity: 0, colorScheme: "normal" } : { backgroundColor: "#f2f1f1", width: "82.5vw", borderRadius: "15px", maxHeight: "80px", opacity: 100, colorScheme: "normal" }}
                            className='Music'
                            onLoad={() => { setIframeLoader(false); }}
                            src={"https://embed.spotify.com/?uri=" + spotifyUri} frameBorder="0" allow="autoplay; clipboard-write; fullscreen; picture-in-picture "
                            seamless={true}
                            loading="eager"
                          >
                          </iframe>
                        }

                      </FadeIn>
                    }
                  </div>
                </>
              )}


            </IonCardContent>
          </IonCard>

          {!noPostsYet &&
            <FadeIn>
              <div style={{ textAlign: "center", alignItems: "center" }}>
                <IonLabel>Posts</IonLabel>
              </div>
            </FadeIn>
          }
        </FadeIn>
      </>
    );
  }

  const Footer = () => {
    if (!busy && userPosts && userPosts.length > 0) {
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
    return <></>
  }

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios" >
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonButton
                color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                mode="ios"
                onClick={() => {
                  navigateBack();
                }}
              >
                <IonIcon icon={chevronBackOutline}></IonIcon> Back
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              {/* <div> */}
              <span id='trigger-popover'>
                {uid !== user?.uid &&
                  <IonButton
                    color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                    slot="end"
                    mode="ios"
                    onClick={() => {
                      let elements: any[] = [];
                      if (user && user.uid && uid) {
                        if (user.uid < uid) {
                          elements.push(uid);
                          elements.push(user.uid);
                        } else {
                          elements.push(user.uid);
                          elements.push(uid);
                        }
                      } else {
                        Toast.error("Unable to open DMs");
                      }
                      dynamicNavigate("/chatroom/" + elements[0] + '_' + elements[1], 'forward')
                    }}
                  >
                    <IonIcon icon={chatbubbleOutline} />
                  </IonButton>
                }
              </span>

              {/* </div> */}
              <IonButton
                color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                disabled
                slot="end"
                mode="ios"
                onClick={() => {
                  sharePost();
                }}
              >
                <IonIcon icon={shareOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>

        <Virtuoso
          overscan={2000}
          endReached={fetchMorePosts}
          className="ion-content-scroll-host"
          data={userPosts}
          style={{ height: "100%" }}
          itemContent={(item: number) => {
            let post = userPosts[item];
            let index = item;
            if (busy) {
              return (
                <FadeIn key={post.key}>
                  <IonList inset={true} mode="ios">
                    <IonItem lines="none" mode="ios">
                      <IonLabel>
                        <IonFab horizontal="end">
                          <IonSkeletonText
                            animated
                            style={{
                              fontSize: "0.75em",
                              width: "30vw",
                            }}
                          />
                        </IonFab>
                        <IonFab horizontal="start" style={{ marginLeft: '-1.5%' }}>
                          <p
                            style={{
                              fontWeight: "bold",
                              color: getColor(post.postType),
                            }}
                          >
                            <IonSkeletonText
                              style={{
                                width: "30vw",
                                height: "1.75em",
                              }}
                              animated
                            />
                          </p>
                        </IonFab>
                        <br></br>
                        <h3
                          className="h2-message"
                          style={{
                            marginLeft: "1.5%",
                            marginTop: "5%",
                          }}
                        >
                          {" "}
                          <IonSkeletonText animated />{" "}
                          {" "}
                          <IonSkeletonText animated />{" "}
                          {" "}
                          <IonSkeletonText animated />{" "}
                        </h3>

                        {post.imgSrc && post.imgSrc.length > 0 ? (
                          <div>
                            <br></br>
                            <br></br>
                            <IonSkeletonText
                              style={{ height: "50vw" }}
                              animated
                            />
                          </div>
                        ) : null}
                      </IonLabel>
                    </IonItem>
                  </IonList>
                </FadeIn>
              );
            }
            return (
              <>
                <FadeIn key={post.key}>
                  <IonList inset={true} mode="ios">
                    <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate("post/" + post.key, 'forward'); }}>
                      <IonLabel>
                        <IonFab horizontal="end">
                          <IonNote style={{ fontSize: "0.75em" }}>
                            {" "}
                            {getDate(post.timestamp)}{" "}
                          </IonNote>
                        </IonFab>
                        <IonFab horizontal="start" style={{ marginLeft: '-1%' }}>
                          {post.postType != "general" ? (
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
                          ) : null}
                        </IonFab>
                        <br></br>
                        {"className" in post && "classNumber" in post && post.className.length > 0 ?
                          <Linkify tagName="h3" className="h2-message" style={{ marginLeft: "2.25%", marginTop: "5%" }}>
                            {post.message} <IonNote onClick={(e) => {
                              e.stopPropagation();
                              dynamicNavigate("class/" + post.className, 'forward');
                            }} color="medium" style={{ fontWeight: "400" }}> &nbsp; — {post.className}{post.classNumber}</IonNote>
                          </Linkify>
                          :
                          <Linkify tagName="h3" className="h2-message" style={{ marginLeft: "2.25%", marginTop: "5%" }}>
                            {post.message}
                          </Linkify>
                        }

                        <PostImages isSensitive={sensitiveToggled} post={post} />

                      </IonLabel>
                    </IonItem>
                    <FadeIn>
                      <IonItem lines="none" mode="ios">
                        <IonButton
                          onAnimationEnd={() => {
                            setLikeAnimation(-1);
                          }}
                          className={
                            likeAnimation === post.key
                              ? "likeAnimation"
                              : ""
                          }
                          disabled={disabledLikeButtons === index}
                          mode="ios"
                          fill="outline"
                          color={
                            userPosts &&
                              user &&
                              userPosts[index].likes[user.uid] !== undefined &&
                              schoolName !== "Cal Poly Humboldt"
                              ? "primary"
                              : userPosts &&
                                user &&
                                userPosts[index].likes[user.uid] !== undefined &&
                                schoolName === "Cal Poly Humboldt" && schoolColorToggled
                                ? "tertiary"
                                : userPosts &&
                                  user &&
                                  userPosts[index].likes[user.uid] !== undefined &&
                                  schoolName === "Cal Poly Humboldt" && !schoolColorToggled
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
                            // history.push("/userPost/" + post.key);
                            dynamicNavigate("post/" + post.key, 'forward');
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
                            dislikeAnimation === post.key
                              ? "likeAnimation"
                              : ""
                          }
                          disabled={disabledLikeButtons === index}
                          mode="ios"
                          fill="outline"
                          color={
                            userPosts &&
                              user &&
                              userPosts[index].dislikes[user.uid] !==
                              undefined
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
                      </IonItem>
                    </FadeIn>
                  </IonList>
                </FadeIn>
              </>
            );
          }}
          components={{ Footer, Header }} />
      </IonContent>
    </IonPage>
  );
};
