import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getLikes } from '../fbconfig';
import RoomIcon from '@mui/icons-material/Room';
import {
  getUserPosts,
  getNextBatchUserPosts,
  getUserData,
  storage,
  upVote,
  downVote,
} from "../fbconfig";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFab,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonPopover,
  IonRow,
  IonSkeletonText,
  IonText,
  IonToolbar,
  RouterDirection,
  useIonRouter,
} from "@ionic/react";
import FadeIn from "react-fade-in";
import { ref, getDownloadURL } from "firebase/storage";
// import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import "../App.css";
import TimeAgo from "javascript-time-ago";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { chatbubblesOutline, chevronBackOutline, logoInstagram, logoSnapchat, logoTiktok, shareOutline } from "ionicons/icons";
import ForumIcon from '@mui/icons-material/Forum';
import { getColor, timeout } from '../components/functions';
import Linkify from 'linkify-react';
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface MatchParams {
  uid: string;
}

export const UserProfile = ({ match }: RouteComponentProps<MatchParams>) => {
  const uid = match.params.uid;
  const router = useIonRouter();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
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
  const Toast = useToast();

  const dynamicNavigate = (path : string, direction : RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }
  const navigateBack = () => {
    if (router.canGoBack()) {
      router.goBack();
    } else {
      Toast.error("something went wrong");
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
    } else {
      return '';
    }
  };

  const fetchMorePosts = (event: any) => {
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
          event.target.complete();
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
    console.log('userprofile');
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

  if (!noPostsYet) {
    return (
      <IonPage>
        <IonContent>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios" >
              <IonButtons style={{ marginLeft: "-2.5%" }}>
                <IonButton
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
                  <IonButton
                    slot="end"
                    mode="ios"
                    disabled={true}
                  >
                    <IonIcon icon={chatbubblesOutline} />
                  </IonButton>
                </span>

                {/* </div> */}
                <IonButton
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


          <br></br><br></br>
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
                          style={{ width: "50vw", height: "1.75em", marginLeft : "5vw", bottom : "-1.9vh" }}
                        />
                        <IonSkeletonText
                          animated={true}
                          style={{ width: "50vw",  marginLeft : "5vw", bottom : "-1.9vh" }}
                        />
                      </IonLabel>
                      {/* </IonFab> */}
                    </IonRow>
                    <div style={{ height: "5vh" }}></div>
                      <IonFab vertical="bottom" horizontal="start">
                        <IonSkeletonText style={{ width: "75vw", marginLeft : "5vw" }} animated />
                        <IonSkeletonText style={{ width: "75vw", marginLeft : "5vw" }} animated />
                        <IonSkeletonText style={{ width: "75vw", marginLeft : "5vw" }} animated />
                      </IonFab>
                  </div>
                ) : (
                  <FadeIn>
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
                            <IonText style={{ fontSize: "0.75em" }}>
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
                            <IonText style={{ fontSize: "0.75em" }}>
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
                      {spotifyUri && spotifyUri.length > 0 &&
                        <FadeIn delay={250} transitionDuration={750}>
                          <br />
                          {darkModeToggled ?
                            <iframe
                              id="iframe1"
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
                  </FadeIn>
                )}


              </IonCardContent>
            </IonCard>

            <div style={{ textAlign: "center", alignItems: "center" }}>
              <IonLabel>Posts</IonLabel>
            </div>

          </FadeIn>


          <br />

          <div>
            <>
              {userPosts && userPosts.length > 0
                ? userPosts.map((post: any, index: number) => {
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
                    <FadeIn key={post.key}>
                      <IonList inset={true} mode="ios">
                        <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate("post/" + post.key, 'forward');}}>
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
                            <Linkify tagName="h3" className="h2-message" style={{ marginLeft: "2.25%", marginTop: "5%" }}>
                              {post.message}
                            </Linkify>

                            {post.imgSrc && post.imgSrc.length > 0 ? (
                              <>
                                <div style={{ height: "0.75vh" }}>{" "}</div>
                                <div
                                  className="ion-img-container"
                                  style={{ backgroundImage: `url(${post.imgSrc})`, borderRadius: '10px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const img: CapacitorImage = {
                                      url: post.imgSrc,
                                      title: `${post.userName}'s post`
                                    };
                                    CapacitorPhotoViewer.show({
                                      options: {
                                        title: true
                                      },
                                      images: [img],
                                      mode: 'one',
                                    });
                                    // PhotoViewer.show(post.imgSrc, `${post.userName}'s post`);
                                  }}
                                >
                                </div>
                              </>
                            ) : (
                              <>
                                {post.url.length > 0 ? (
                                  <>
                                    <br></br>
                                    <div
                                      className="ion-img-container"
                                      style={{ backgroundImage: `url(${post.imgSrc})`, borderRadius: '10px' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const img: CapacitorImage = {
                                          url: post.imgSrc,
                                          title: `${post.userName}'s post`
                                        };
                                        CapacitorPhotoViewer.show({
                                          options: {
                                            title: true
                                          },
                                          images: [img],
                                          mode: 'one',
                                        });
                                        // PhotoViewer.show(post.imgSrc, `${post.userName}'s post`);
                                      }}
                                    >
                                    </div>
                                  </>
                                ) : null}
                              </>
                            )}
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
                                  userPosts[index].likes[user.uid] !== undefined
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
                  );
                })
                : null}
            </>
            <IonInfiniteScroll
              onIonInfinite={(e: any) => { fetchMorePosts(e) }}
              disabled={noMorePosts}
            >
              <IonInfiniteScrollContent
                loadingSpinner="circular"
                loadingText="Loading"
              ></IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </div>
        </IonContent>
      </IonPage>
    );
  } else {
    return (
      <IonPage>
        <IonContent>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios" >
              <IonButtons slot="start">
                <IonButton
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
                  <IonButton
                    slot="end"
                    mode="ios"
                    disabled={true}
                  >
                    <IonIcon icon={chatbubblesOutline} />
                  </IonButton>
                </span>

                {/* </div> */}
                <IonButton
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
          <br></br><br></br>
          <FadeIn>
            <IonCard mode="ios">
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
                          <IonText style={{ fontSize: "0.75em" }}>
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
                          <IonText style={{ fontSize: "0.75em" }}>
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
                  </div>
                )}
              </IonCardContent>
            </IonCard>
            <div style={{ textAlign: "center", alignItems: "center" }}>
              <IonLabel>Posts</IonLabel>
            </div>
          </FadeIn>

        </IonContent>
      </IonPage>
    );
  }
};
