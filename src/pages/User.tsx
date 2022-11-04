import {
  IonHeader, IonContent, IonLoading, IonButton,
  IonInput, IonFab, IonTextarea, IonImg, IonAvatar,
  IonTitle, IonToolbar, IonList, IonItem,
  IonIcon, IonLabel, IonModal, IonToggle,
  IonText, IonCardContent, IonCard, IonSkeletonText,
  IonNote, IonSpinner, IonButtons, IonCardTitle,
  IonPage, useIonViewDidEnter, IonRow, IonCol,
  IonGrid, IonSearchbar, useIonRouter, RouterDirection, IonBadge
} from "@ionic/react";
import React, { useRef, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  storage, logout, db, promiseTimeout,
  checkUsernameUniqueness, uploadImage,
  getUserPosts, upVote, downVote, getNextBatchUserPosts,
  removePost, getUserLikedPostsNextBatch, getUserLikedPosts,
  getYourPolls, updateUserInfo, getCurrentUserData,
  removePoll, getLikes, spotifySearch
} from "../fbconfig";
import DeleteIcon from "@mui/icons-material/Delete";
import auth from "../fbconfig";
import {
  Camera,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
import {
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import "../App.css";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import TimeAgo from "javascript-time-ago";
import { useSelector } from "react-redux";
import {
  arrowForward, cameraReverseOutline, chatbubblesOutline, chevronBackOutline, colorFill, 
  logoInstagram,logoSnapchat, logoTiktok, moon, refreshOutline, warningSharp
} from "ionicons/icons";
import { updateEmail } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setDarkMode, setSchoolColorPallete, setSensitiveContent } from "../redux/actions";
import FadeIn from "react-fade-in";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { informationCircleOutline } from "ionicons/icons";
import ForumIcon from "@mui/icons-material/Forum";
import {
  Keyboard,
  KeyboardStyle,
  KeyboardStyleOptions,
} from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";
import { getColor, timeout } from '../components/functions';
import UIContext from "../my-context";
import { Dialog } from "@capacitor/dialog";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import ProfilePhoto from "./ProfilePhoto";
import Linkify from "linkify-react";

const titleStyle = {
  fontSize: "1.4em",
  textAlign: "center"
};

function User() {
  const timeAgo = new TimeAgo("en-US");
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const { setShowTabs } = React.useContext(UIContext);
  const Toast = useToast();
  const dispatch = useDispatch();
  const schoolName = useSelector((state: any) => state.user.school);
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const sensitiveToggled = useSelector((state: any) => state.sensitive.sensitiveContent);
  const notif = useSelector((state: any) => state.notifSet.set);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const inputUserRef = useRef<HTMLIonInputElement>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editableUsername, setEditableUsername] = useState("");
  const [userLikedPosts, setUserLikedPosts] = useState<any[] | null>(null);
  const [userPosts, setUserPosts] = useState<any[] | null>(null);
  const [editableEmail, setEditableEmail] = useState("");
  const [passwordReAuth, setPasswordReAuth] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [credentialsModal, setCredentialsModal] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState<any>();
  const [lastLikesKey, setLastLikesKey] = useState<any>();
  const [disabledDeleteButton, setDisabledDeleteButton] = useState<boolean>(false);
  const [noMoreLikes, setNoMoreLikes] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [credentialsUserModal, setCredentialsUserModal] = useState<boolean>(false);
  const [loadingUserPosts, setLoadingUserPosts] = useState<boolean>(false);
  const [yourPolls, setYourPolls] = useState<any[] | null>(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [busy, setBusy] = useState<boolean>(false);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const history = useHistory();
  const [userUid, setUserUid] = useState<string>("");
  const [userBio, setUserBio] = useState<string>("");
  const [userMajor, setUserMajor] = useState<string>("");
  const [userTiktok, setUserTiktok] = useState<string>("");
  const [userInstagram, setUserInstagram] = useState<string>("");
  const [userSnapchat, setUserSnapchat] = useState<string>("");
  const [editableUserBio, setEditableUserBio] = useState<string>("");
  const [editableUserMajor, setEditableUserMajor] = useState<string>("");
  const [editableUserTiktok, setEditableUserTiktok] = useState<string>("");
  const [editableUserInstagram, setEditableUserInstagram] = useState<string>("");
  const [editableUserSnapchat, setEditableUserSnapchat] = useState<string>("");
  const [showEditEmailModal, setShowEditEmailModal] = useState<boolean>(false);
  const [userDataHasLoaded, setUserDataHasLoaded] = useState<boolean>(false);
  const [showEditUsernameModal, setShowEditUsernameModal] = useState<boolean>(false);
  const [notifs, setNotifs] = useState<any[] | null>(null);
  const [spotifyTextSearch, setSpotifyTextSearch] = useState<string>("");
  const [spotifyModal, setSpotifyModal] = useState<boolean>(false);
  const [spotifyLoading, setSpotifyLoading] = useState<boolean>(false);
  const [spotifyResults, setSpotifyResults] = useState<any[]>([]);
  const [spotifyUri, setSpotifyUri] = useState<string>("");
  const [editableSpotifyUri, setEditableSpotifyUri] = useState<string>("");
  const [aboutEdit, setAboutEdit] = useState<boolean>(true);
  const emojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  const router = useIonRouter();
  const [loadedSlidesArr, setLoadedSlidesArr] = useState<boolean[]>([false, false, false, false, false, false])


  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }

  const scrollToTop = () => {
    contentRef.current && contentRef.current.scrollToTop(500);
  };

  const keyStyleOptionsDark: KeyboardStyleOptions = {
    style: KeyboardStyle.Dark,
  };

  const keyStyleOptionsLight: KeyboardStyleOptions = {
    style: KeyboardStyle.Light,
  };

  const toggleDarkModeHandler = async (isChecked: boolean) => {
    document.body.classList.toggle("dark");
    dispatch(setDarkMode(isChecked));
    localStorage.setItem("darkMode", JSON.stringify(isChecked));
    if (isChecked) {
      await Keyboard.setStyle(keyStyleOptionsDark);
      await StatusBar.setStyle({ style: Style.Dark });
    } else {
      await Keyboard.setStyle(keyStyleOptionsLight);
      await StatusBar.setStyle({ style: Style.Light });
    }
  };

  const toggleSchoolColorPallete = async (isChecked: boolean) => {
    dispatch(setSchoolColorPallete(isChecked));
    localStorage.setItem("schoolColorPallete", JSON.stringify(isChecked));
  }

  const toggleSensitiveContent= async (isChecked: boolean) => {
    console.log(isChecked);
    dispatch(setSensitiveContent(isChecked));
    localStorage.setItem("sensitiveContent", JSON.stringify(isChecked));
  }

  const handleEditAbout = () => {
    if (user && user.uid) {
      if (!userDataHasLoaded) {
        const gotUserData = promiseTimeout(7500, getCurrentUserData());
        gotUserData.then((res: any) => {
          if (res) {
            setUserBio(res.bio);
            setUserMajor(res.major);
            setUserInstagram(res.instagram);
            setUserSnapchat(res.snapchat);
            setUserTiktok(res.tiktok);
            setSpotifyUri(res.spotify);
            setEditableUserBio(res.bio);
            setEditableUserMajor(res.major);
            setEditableUserInstagram(res.instagram);
            setEditableUserSnapchat(res.snapchat);
            setEditableUserTiktok(res.tiktok);
            setEditableSpotifyUri(res.spotify);
            setNotifs(res.notifs);
          } else {
            Toast.error("Trouble loading data");
            setAboutEdit(false);
          }
          setUserDataHasLoaded(true);
        });
        gotUserData.catch((err) => {
          Toast.error(err);
        });
      }
      setShowAboutModal(true);
    } else {
      Toast.error("Trouble handling request");
    }
  }

  const handleEdit = () => {
    setShowEditEmailModal(true);
    // handleCheckmark();
  };

  const handleUserEdit = () => {
    setShowEditUsernameModal(true);
    // handleUserCheckmark();
  };

  const handleChangeEmailString = (e: any) => {
    setEditableEmail(e.detail.value);
  };

  const handleChangeUsernameString = (e: any) => {
    setEditableUsername(e.detail.value);
  };

  const handleCheckmark = () => {
    if (emojis.test(editableEmail)) {
      Toast.error("Email cannot contain emojis!");
    } else if (editableEmail.trim().length <= 0) {
      Toast.error("Email cannot be blank");
    } else if (editableEmail.trim() != email.trim()) {
      promptForCredentials();
    } else {
      Toast.error("No changes made");
    }
  };

  const handleUserCheckmark = () => {
    if (emojis.test(editableUsername)) {
      Toast.error("Username cannot contain emojis!");
    } else if (editableUsername.trim().length <= 0) {
      Toast.error("Username cannot be blank");
    } else if (editableUsername.trim().length > 15) {
      Toast.error("Username cannot be longer than 15 characters");
    } else if (editableUsername.includes(" ")) {
      Toast.error("Username cannot contain spaces!");
    } else if (editableUsername.trim() != username.trim()) {
      promptForUsernameCredentials();
    } else {
      Toast.error("No changes made");
    }
  };

  const promptForCredentials = () => {
    setCredentialsModal(true);
  };

  const promptForUsernameCredentials = () => {
    setCredentialsUserModal(true);
  };

  async function handleProfilePictureEdit() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      }).catch((err) => { Toast.error("Picture not supported / something went wrong"); return; });
      if (!image) return;
      setBusy(true);
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if (blobRes) {
        if (blobRes.size > 5_000_000) {
          // 5MB
          Toast.error("Image too large");
          setBusy(false);
        } else {
          uploadImage("profilePictures", blobRes, "photoURL").then(
            (hasUploaded) => {
              if (hasUploaded == false) {
                Toast.error("Unable to update profile image");
                setBusy(false);
              } else {
                if (user) {
                  getDownloadURL(
                    ref(storage, "profilePictures/" + user.uid + "photoURL")
                  ).then((url) => {
                    updateProfile(user, {
                      photoURL: url,
                    })
                      .then(() => {
                        setProfilePhoto(url);
                        Toast.success("photo uploaded successfully");
                        localStorage.setItem("profilePhoto", JSON.stringify(url));
                        setBusy(false);
                      })
                      .catch((err) => {
                        Toast.error(err.message.toString());
                        setBusy(false);
                      });
                  });
                } else {
                  Toast.error(
                    "Unable to update profile image, try logging out then back in"
                  );
                  setBusy(false);
                }
              }
            }
          );
        }
      }
    } catch (err: any) {
      // Toast.error(err.message.toString());
      setBusy(false);
      console.log("SOMETHING WENT WRONG 2");
    }
  }

  const handleUpdateAboutUser = async () => {
    setUserDataHasLoaded(false);
    if (String(editableUserBio).trim() == String(userBio).trim()
      && String(editableUserInstagram).trim() == String(userInstagram).trim()
      && String(editableUserSnapchat).trim() == String(userSnapchat).trim()
      && String(editableUserMajor).trim() == String(userMajor).trim()
      && String(editableUserTiktok).trim() == String(userTiktok).trim()
      && String(editableSpotifyUri).trim() == String(spotifyUri).trim()) {
      Toast.error("No changes made");
      setUserDataHasLoaded(true);
      return;
    }
    let userDataUpdated = promiseTimeout(10000, updateUserInfo(editableUserBio, editableUserInstagram, editableUserMajor, editableUserSnapchat, editableUserTiktok, editableSpotifyUri));
    userDataUpdated.then((res) => {
      if (res) {
        setUserBio(editableUserBio);
        setUserSnapchat(editableUserSnapchat);
        setUserInstagram(editableUserInstagram);
        setUserTiktok(editableUserTiktok);
        setUserMajor(editableUserMajor);
        setSpotifyUri(editableSpotifyUri);
        Keyboard.hide().then(() => {
          setTimeout(() => setShowAboutModal(false), 100);
        }).catch((err) => {
          setTimeout(() => setShowAboutModal(false), 100);
        })
        Toast.success("Updated!");
      } else {
        Toast.error("Something went wrong, try again");
      }
      setUserDataHasLoaded(true);
    });
    userDataUpdated.catch((err) => {
      Toast.error(err);
      setUserDataHasLoaded(true);
    });
    setUserDataHasLoaded(true);
  };

  const deletePoll = async (deletePollIndex: number, deletePollKey: string) => {
    const { value } = await Dialog.confirm({
      title: 'Delete Poll',
      message: `Are you sure you'd like to delete your poll?`,
      okButtonTitle: 'Delete'
    });
    if (!value) { return; }
    setDisabledDeleteButton(true);
    if (yourPolls && yourPolls.length > 0 && schoolName) {
      const didDelete = promiseTimeout(10000, removePoll(deletePollKey, schoolName));
      didDelete.then((res) => {
        if (res) {
          Toast.success("Poll deleted");
          let tempPolls: any[] = [];
          for (let i = 0; i < yourPolls.length; ++i) {
            if (i !== deletePollIndex) {
              tempPolls.push(yourPolls[i]);
            }
          }
          setYourPolls(tempPolls);
        } else {
          Toast.error("Unable to delete poll rn");
        }
        setDisabledDeleteButton(false);
      });
      didDelete.catch((err) => {
        Toast.error(err);
        setDisabledDeleteButton(false);
      });
    } else {
      Toast.error("Unable to delete poll");
      setDisabledDeleteButton(false);
    }

  };

  const deletePost = async (deletePostIndex: number, deletePostKey: string, deletePostUrl: string[]) => {
    console.log(deletePostUrl);
    const { value } = await Dialog.confirm({
      title: 'Delete Post',
      message: `Are you sure you'd like to delete your post?`,
      okButtonTitle: 'Delete'
    });
    if (!value) { return; }
    setDisabledDeleteButton(true);
    if (userPosts && userPosts.length > 0 && schoolName) {
      let tempPosts: any[] = [];
      let oldPosts: any[] = [];
      for (let i = 0; i < userPosts.length; ++i) {
        if (i !== deletePostIndex) {
          tempPosts.push(userPosts[i]);
        }
      }
      setUserPosts(tempPosts);
      const didDelete = promiseTimeout(20000, removePost(deletePostKey, schoolName, deletePostUrl));
      didDelete.then((res) => {
        if (res) {
          Toast.success("Post deleted");
        } else {
          Toast.error("Unable to delete post rn");
          setUserPosts(oldPosts);
        }
        setDisabledDeleteButton(false);
      });
      didDelete.catch((err) => {
        Toast.error(err);
        setUserPosts(oldPosts);
        setDisabledDeleteButton(false);
      });
    } else {
      Toast.error("Unable to delete post rn");
    }
    setDisabledDeleteButton(false);
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

  async function handleUsernameChange() {
    Keyboard.hide().then(() => {
      setTimeout(() => setCredentialsUserModal(false), 100);
    }).catch((err) => {
      setTimeout(() => setCredentialsUserModal(false), 100);
    });
    setBusy(true);
    const isUnique = await checkUsernameUniqueness(editableUsername.trim());
    if (!isUnique) {
      Toast.error("Username has been taken!");
      setEditableUsername(username);
      setBusy(false);
      setPasswordReAuth("");
    } else {
      if (user && user.displayName) {
        const credentials = EmailAuthProvider.credential(
          user.email!,
          passwordReAuth
        );
        reauthenticateWithCredential(user, credentials)
          .then(() => {
            const usernameChange = promiseTimeout(
              20000,
              updateProfile(user, {
                displayName: editableUsername,
              })
            );
            usernameChange.then(() => {
              if (user && user.uid) {
                const userDataRef = doc(db, "userData", user.uid);
                const usernameDocChange = promiseTimeout(
                  20000,
                  updateDoc(userDataRef, {
                    userName: editableUsername,
                  })
                );
                usernameDocChange.then(() => {
                  Toast.success("Updated username");
                  setUsername(editableUsername);
                  Keyboard.hide().then(() => {
                    setTimeout(() => setCredentialsUserModal(false), 100);
                  }).catch((err) => {
                    setTimeout(() => setCredentialsUserModal(false), 100);
                  });
                  setBusy(false);
                });
                usernameDocChange.catch((err: any) => {
                  Toast.error(err);
                  setEditableUsername(username);
                  setBusy(false);
                });
              } else {
                Toast.error("Unable to update username");
              }
            });
            usernameChange.catch((err: any) => {
              Toast.error(err);
              setEditableUsername(username);
              setBusy(false);
            });
          })
          .catch((err) => {
            Toast.error(err.message.toString());
            setBusy(false);
            setEditableUsername(username);
          });
      } else {
        Toast.error("user not defined");
        setBusy(false);
        setEditableUsername(username);
      }
    }
  }

  async function handleEmailChange() {
    setBusy(true);
    if (user && user.email) {
      if (user.email == editableEmail) {
        Toast.error("No changes made");
        setBusy(false);
        Keyboard.hide().then(() => {
          setTimeout(() => setCredentialsModal(false), 100);
        }).catch((err) => {
          setTimeout(() => setCredentialsModal(false), 100);
        });
      } else {
        const credentials = EmailAuthProvider.credential(
          user.email!,
          passwordReAuth
        );
        reauthenticateWithCredential(user, credentials)
          .then(() => {
            updateEmail(user, editableEmail)
              .then(() => {
                if (user && user.uid) {
                  const userDataRef = doc(db, "userData", user.uid);
                  updateDoc(userDataRef, {
                    userEmail: editableEmail,
                  })
                    .then(() => {
                      Toast.success("Updated email");
                      setEmail(editableEmail);
                      Keyboard.hide().then(() => {
                        setTimeout(() => setCredentialsModal(false), 100);
                      }).catch((err) => {
                        setTimeout(() => setCredentialsModal(false), 100);
                      });
                      setBusy(false);
                    })
                    .catch((err) => {
                      Toast.error(err.message.toString());
                      setEditableEmail(email);
                      setBusy(false);
                    });
                } else {
                  Toast.error(
                    "Updated email but view was unable to be updated"
                  );
                  setEditableEmail(email);
                  setBusy(false);
                }
              })
              .catch((err) => {
                Toast.error(err.message.toString());
                setEditableEmail(email);
                setBusy(false);
              });
          })
          .catch((err) => {
            Toast.error(err.message.toString());
            setEditableEmail(email);
            setBusy(false);
          });
      }
    } else {
      Toast.error("Unable to update emiail");
      setEditableEmail(email);
      setBusy(false);
    }
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

  const getTimeLeft = (timestamp: any) => {
    const time = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    const today = new Date();
    const ms = today.getTime() - time.getTime();
    return (4 - (Math.floor(ms / (1000 * 60 * 60 * 24)))) > 0 ? (4 - (Math.floor(ms / (1000 * 60 * 60 * 24)))).toString() : '0';
  }

  const fetchMorePosts = () => {
    if (lastKey && user) {
      setLoadingUserPosts(true);
      getNextBatchUserPosts(schoolName, user.uid, lastKey)
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
          setUserPosts(userPosts?.concat(res.userPosts)!);
          if (res.userPosts.length == 0) {
            setNoMorePosts(true);
          }
          setLoadingUserPosts(false);
        })
        .catch((err: any) => {
          Toast.error(err.message.toString());
        });
    } else {
      setNoMorePosts(true);
    }
  };

  const fetchMoreLikes = () => {
    if (lastLikesKey && user) {
      console.log("clicked");
      console.log(lastLikesKey);
      getUserLikedPostsNextBatch(user.uid, lastLikesKey).then((res: any) => {
        console.log(res);
        setLastLikesKey(res.lastKey);
        setUserLikedPosts(userLikedPosts?.concat(res.userLikes)!);
        if (res.userLikes.length == 0) {
          setNoMoreLikes(true);
        }
      }).catch((err: any) => {
        Toast.error(err.message.toString());
      });
    } else {
      setNoMoreLikes(true);
    }
  }

  const loadYourPolls = () => {
    if (user && schoolName) {
      const yourPollsLoaded = promiseTimeout(10000, getYourPolls(schoolName, user.uid));
      yourPollsLoaded.then((res) => {
        if (res) {
          setYourPolls(res);
        } else {
          Toast.error("Something went wrong when loading your polls");
        }
      });
      yourPollsLoaded.catch((err) => {
        Toast.error(err + "\n Check your internet connection");
      });
    }
  };

  async function loadLogout() {
    const { value } = await Dialog.confirm({
      title: 'Logout',
      message: `Are you sure you want to logout?`,
      okButtonTitle: 'Logout'
    });
    if (!value) { return; }
    let promise = promiseTimeout(10000, logout());
    promise.then((loggedOut: boolean) => {
      if (loggedOut) {
        window.localStorage.clear();
        localStorage.clear();
        Toast.success("Logging out...");
      } else {
        Toast.error("Unable to logout");
      }
    });
    promise.catch((err: any) => {
      Toast.error(err);
    });
  }

  const handleUserBioChange = (e: any) => {
    let currBio = e.detail.value;
    setEditableUserBio(currBio);
  };
  const handleUserMajorChange = (e: any) => {
    let currMajor = e.detail.value;
    setEditableUserMajor(currMajor);
  };
  const handleUserTiktokChange = (e: any) => {
    let curr = e.detail.value;
    setEditableUserTiktok(curr);
  };
  const handleUserSnapchatChange = (e: any) => {
    let curr = e.detail.value;
    setEditableUserSnapchat(curr);
  };
  const handleUserInstagramChange = (e: any) => {
    let curr = e.detail.value;
    setEditableUserInstagram(curr);
  };

  const loadUserLikes = () => {
    if (schoolName && user) {
      const hasLoaded = promiseTimeout(
        5000,
        getUserLikedPosts(user.uid)
      );
      hasLoaded.then((res) => {
        if (res) {
          setUserLikedPosts(res.userLikes);
          setLastLikesKey(res.lastKey);
        }
      });
      hasLoaded.catch((err) => {
        Toast.error(err);
      });
    }
  };

  const loadNotifications = () => {
    if (user && user.uid) {
      // if (!userDataHasLoaded) {
      const gotUserData = promiseTimeout(7500, getCurrentUserData());
      gotUserData.then((res: any) => {
        if (res) {
          setUserBio(res.bio);
          setUserMajor(res.major);
          setUserInstagram(res.instagram);
          setUserSnapchat(res.snapchat);
          setUserTiktok(res.tiktok);
          setSpotifyUri(res.spotify);
          setEditableUserBio(res.bio);
          setEditableUserMajor(res.major);
          setEditableUserInstagram(res.instagram);
          setEditableUserSnapchat(res.snapchat);
          setEditableUserTiktok(res.tiktok);
          setEditableSpotifyUri(res.spotify);
          res.notifs.sort(function (a: any, b: any) {
            var keyA = new Date(a.date), keyB = new Date(b.date);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });
          setNotifs(res.notifs);
        } else {
          Toast.error("Trouble loading data");
          setAboutEdit(false);
        }
        setUserDataHasLoaded(true);
      });
      gotUserData.catch((err) => {
        Toast.error(err);
      });
    }
  };

  const loadUserPosts = () => {
    setLoadingUserPosts(true);
    if (schoolName && user) {
      const hasLoaded = promiseTimeout(
        5000,
        getUserPosts(schoolName, user.uid)
      );
      hasLoaded.then(async (res) => {
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
          setLoadingUserPosts(false);
        }
      });
      hasLoaded.catch((err) => {
        Toast.error(err);
      });
    }
    setLoadingUserPosts(false);
  };

  const handleSpotifySearch = async () => {
    await timeout(100);
    if (spotifyTextSearch.trim().length <= 0) {
      Toast.error("Enter a search query");
      return;
    }
    setSpotifyTextSearch("");
    setSpotifyLoading(true);
    spotifySearch(spotifyTextSearch).then((res: any) => {
      setSpotifyResults(res);
      console.log.apply(res);
      if (res && res.length == 0) {
        Toast.error("No results");
      }
      setSpotifyLoading(false);
    }).catch((err) => {
      console.log(err);
      Toast.error("Unable to get results");
      setSpotifyLoading(false);
    });
  };

  const isEnterPressed = (key: string) => {
    if (key === "Enter") {
      Keyboard.hide();
      handleSpotifySearch();
    }
  };

  useIonViewDidEnter(() => {
    // scrollToTop();
    setShowTabs(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      setEmail(user.email!);
      setEditableEmail(user.email!);
      setUsername(user.displayName!);
      setEditableUsername(user.displayName!);
      setBusy(false);
    }
  }, [user])

  useEffect(() => {
    console.log("notificationsToken: ", localStorage.getItem("notificationsToken"));
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (!loading && user) {
        // console.log(user);
        // let url = localStorage.getItem("profilePhoto") || "false";
        // if (url == "false") {
        setProfilePhoto(user.photoURL!);
        // } else {
        // setProfilePhoto(url);
        // }
        setEmail(user.email!);
        setEditableEmail(user.email!);
        setUsername(user.displayName!);
        setEditableUsername(user.displayName!);
        setUserUid(user.uid!);
        setBusy(false);
      }
      return () => { };
    }
  }, [user]);

  if (loading) {
    return (
      <IonLoading
        message="Please wait..."
        duration={5000}
        isOpen={busy}
      ></IonLoading>
    );
  }
  return (
    <IonPage>
      <IonContent ref={contentRef} className="no-scroll-content" scrollY={false}>
        {/* <IonHeader class="ion-no-border" style={{ textAlign: "center" }}> */}
        <IonToolbar mode="ios" style={{ height: "5vh" }}>
          <IonButtons slot="start">
            <IonButton
              // style={{opacity: "40%"}}
              // disabled
              onClick={loadLogout}
              color="danger"
              mode="ios"
              fill="clear"
              id="logout"
            >
              Logout
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
              onClick={() => {
                if (user) { dynamicNavigate('direct/' + user.uid, "forward") }
              }}
            >
              <IonIcon icon={chatbubblesOutline}>
              </IonIcon>
              {notif && <IonBadge color='danger'>{'!'}</IonBadge>}
            </IonButton>
            <IonButton
              color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
              onClick={() => {
                dynamicNavigate("privacy-policy", "forward");
                // history.push("/privacy-policy");
              }}
            >
              <IonIcon icon={informationCircleOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <IonHeader mode="ios" class="ion-no-border" style={{ textAlign: "center", }}>
          {/* <IonToolbar mode="ios"> */}
          <IonAvatar className="user-avatar">
            <IonImg style={{ opacity: "80%" }} className="user-image" src={profilePhoto}></IonImg>
            <IonIcon size="large" icon={cameraReverseOutline} onClick={handleProfilePictureEdit}
              style={{ zIndex: "2", position: "absolute", margin: "auto", left: "54%", top: "0%" }}
            />
          </IonAvatar>
          {/* <IonButton
            style={{zIndex: "999", right: "10%"}}
                    onClick={handleProfilePictureEdit}
                    color="primary"
                  >
                    {" "}
                    Edit{" "}
                  </IonButton> */}
          {/* </IonToolbar> */}
        </IonHeader>
        <FadeIn>
          {/* <IonToolbar mode="ios"> */}
          <IonTitle size="small" style={titleStyle}>
            Hello
            <IonText color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} onClick={() => { dynamicNavigate('about/' + userUid, 'forward'); }} >&nbsp;{editableUsername}</IonText>
          </IonTitle>
          {/* </IonToolbar> */}
        </FadeIn>
        {/* </IonHeader> */}
        <IonLoading
          message="Please wait..."
          duration={5000}
          isOpen={busy}
        ></IonLoading>

        <IonModal
          isOpen={spotifyModal}
          onDidDismiss={() => {
            Keyboard.hide();
          }}
        >
          <IonContent>
            <IonToolbar mode="ios">
              <IonButtons style={{ marginLeft: "-2.5%" }}>
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  onClick={() => {
                    Keyboard.hide().then(() => {
                      setSpotifyModal(false);
                      setSpotifyTextSearch("");
                      setSpotifyResults([]);
                    }).catch((err) => {
                      setSpotifyModal(false);
                      setSpotifyTextSearch("");
                      setSpotifyResults([]);
                    });
                  }}
                >
                  Close
                </IonButton>
              </IonButtons>
              <IonTitle>Spotify Search</IonTitle>
            </IonToolbar>
            <IonToolbar mode="ios" >
              <IonSearchbar color={darkModeToggled ? "" : "medium"} debounce={0} value={spotifyTextSearch} enterkeyhint="search" onKeyDown={e => isEnterPressed(e.key)} onIonChange={e => setSpotifyTextSearch(e.detail.value!)} showCancelButton="focus" animated={true}></IonSearchbar>
            </IonToolbar>
            <hr style={{ opacity: "50%", width: "85vw" }}></hr>
            {spotifyLoading &&
              <IonSpinner color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} className='ion-spinner' />
            }
            {spotifyResults && spotifyResults.length > 0 &&
              <>
                <IonList mode="ios">
                  {spotifyResults.map((track, index) => {
                    return (
                      <FadeIn delay={1000} transitionDuration={750}>
                        <IonItem key={track.id + index.toString()} mode="ios" lines="none">
                          <iframe id={"iframe_" + index.toString()} style={{ width: "75vw", borderRadius: "15px", maxHeight: "80px" }} className='Music'
                            src={"https://embed.spotify.com/?uri=" + track.uri + "?autoplay=1"} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
                          <IonButton style={{ alignItems: "center", textAlign: "center", width: "25vw" }} key={track.id + index.toString()} color="medium" mode="ios" fill="clear" onClick={() => { setEditableSpotifyUri(track.uri); setSpotifyModal(false); setSpotifyTextSearch(""); setSpotifyResults([]); }}>Select</IonButton>
                        </IonItem>
                        <br></br>
                      </FadeIn>
                    )
                  })}
                </IonList>
              </>
            }
          </IonContent>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={showAboutModal}>
          <IonContent>
            <div slot="fixed" style={{ width: "100%" }}>
              <IonToolbar mode="ios" >
                <IonButtons style={{ marginLeft: "-2.5%" }}>
                  <IonButton
                    color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                    mode="ios"
                    onClick={() => {
                      Keyboard.hide().then(() => {
                        setTimeout(() => {
                          setShowAboutModal(false);
                          setEditableUserBio(userBio);
                          setEditableUserInstagram(userInstagram);
                          setEditableUserMajor(userMajor);
                          setEditableUserTiktok(userTiktok);
                          setEditableUserSnapchat(userSnapchat);
                          setEditableSpotifyUri(spotifyUri);
                        }, 100);
                      }).catch((err) => {
                        setTimeout(() => {
                          setShowAboutModal(false);
                          setEditableUserBio(userBio);
                          setEditableUserInstagram(userInstagram);
                          setEditableUserMajor(userMajor);
                          setEditableUserTiktok(userTiktok);
                          setEditableUserSnapchat(userSnapchat);
                          setEditableSpotifyUri(spotifyUri);
                        }, 100);
                      })

                    }}
                  >
                    <IonIcon icon={chevronBackOutline}></IonIcon> Back
                  </IonButton>
                </IonButtons>
                <IonButtons slot="end">
                  <IonButton
                    color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                    disabled={!aboutEdit}
                    slot="end"
                    mode="ios"
                    onClick={() => { handleUpdateAboutUser(); }}
                  >Save</IonButton>
                </IonButtons>
              </IonToolbar>
            </div>
            <IonLoading isOpen={!userDataHasLoaded} spinner="dots" />
            <br /> <br />
            <IonCard mode="ios">
              <IonCardContent>
                <IonLabel>About</IonLabel>
                <IonTextarea
                  style={{ fontWeight: "bold" }}
                  rows={4}
                  mode="ios"
                  id="bio"
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  maxlength={150}
                  value={editableUserBio}
                  onIonChange={(e: any) => {
                    handleUserBioChange(e);
                  }}
                />
              </IonCardContent>
            </IonCard>
            <IonCard mode="ios">
              <IonCardContent>
                <IonLabel>Major</IonLabel>
                <IonInput
                  style={{ fontWeight: "bold" }}
                  mode="ios"
                  id="major"
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  maxlength={50}
                  value={editableUserMajor}
                  onIonChange={(e: any) => {
                    handleUserMajorChange(e);
                  }}
                />
              </IonCardContent>
            </IonCard>
            <IonCard mode="ios">
              <IonCardContent>
                <IonLabel>Snapchat <IonIcon icon={logoSnapchat} /> </IonLabel>
                <IonInput
                  style={{ fontWeight: "bold" }}
                  mode="ios"
                  id="bio"
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  maxlength={50}
                  value={editableUserSnapchat}
                  onIonChange={(e: any) => {
                    handleUserSnapchatChange(e);
                  }}
                />
              </IonCardContent>
            </IonCard>
            <IonCard mode="ios">
              <IonCardContent>
                <IonLabel>Instagram <IonIcon icon={logoInstagram} /> </IonLabel>
                <IonTextarea
                  style={{ fontWeight: "bold" }}
                  mode="ios"
                  id="bio"
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  maxlength={50}
                  value={editableUserInstagram}
                  onIonChange={(e: any) => {
                    handleUserInstagramChange(e);
                  }}
                />
              </IonCardContent>
            </IonCard>
            <IonCard mode="ios">
              <IonCardContent>
                <IonLabel>TikTok <IonIcon icon={logoTiktok} /> </IonLabel>
                <IonTextarea
                  style={{ fontWeight: "bold" }}
                  mode="ios"
                  id="bio"
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  maxlength={50}
                  value={editableUserTiktok}
                  onIonChange={(e: any) => {
                    handleUserTiktokChange(e);
                  }}
                />
              </IonCardContent>
            </IonCard>
            <IonCard mode="ios">
              <IonCardContent>
                <IonLabel>Spotify Song Spotlight</IonLabel>
                <br /><br />
                {editableSpotifyUri && editableSpotifyUri.length > 0 &&
                  <iframe style={{ width: "82.5vw", borderRadius: "15px", maxHeight: "80px" }} className='Music'
                    src={"https://embed.spotify.com/?uri=" + editableSpotifyUri} frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
                  </iframe>
                }
                {/* <IonTextarea
                  style={{ fontWeight: "bold" }}
                  mode="ios"
                  id="bio"
                  color="primary"
                  maxlength={50}
                  value={spotifyTextSearch}
                  onIonChange={(e: any) => {
                    handleSpotifyChange(e);
                  }}
                /> */}
                {editableSpotifyUri && editableSpotifyUri.length > 0 ?
                  <IonRow>
                    <IonCol>
                      <IonButton
                        color="danger"
                        mode="ios"
                        shape="round"
                        fill="clear"
                        expand="block"
                        onClick={() => { setEditableSpotifyUri(""); }}
                      >
                        Remove
                      </IonButton>
                    </IonCol>
                    <IonCol>
                      <IonButton
                        color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                        mode="ios"
                        shape="round"
                        fill="clear"
                        expand="block" onClick={() => {
                          setSpotifyModal(true);
                        }}>
                        Change
                      </IonButton>
                    </IonCol>
                  </IonRow>
                  :
                  <IonRow>
                    <IonCol>
                      <IonButton
                        color="transparent"
                        mode="ios"
                        shape="round"
                        fill="clear"
                        expand="block" onClick={() => {
                          setSpotifyModal(true);
                        }}>
                        Add
                      </IonButton>
                    </IonCol>
                  </IonRow>
                }

              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={showEditEmailModal}>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios" >
              <IonButtons style={{ marginLeft: "-2.5%" }}>
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  onClick={() => {
                    Keyboard.hide().then(() => {
                      setTimeout(() => setShowEditEmailModal(false), 100);
                    }).catch((err) => {
                      setTimeout(() => setShowEditEmailModal(false), 100);
                    });
                    if (user && user.email) { setEditableEmail(user.email); }
                  }}
                >
                  <IonIcon icon={chevronBackOutline}></IonIcon> Back
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton mode="ios" color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} fill="clear" onClick={handleCheckmark} disabled={!aboutEdit}>Save</IonButton>
              </IonButtons>
            </IonToolbar>
          </div>
          <br />
          <IonItem mode="ios">
            <IonInput
              mode="ios"
              style={{ width: "75vw" }}
              ref={inputRef}
              readonly={false}
              value={editableEmail}
              onIonChange={(e) => {
                handleChangeEmailString(e);
              }}
            ></IonInput>
          </IonItem>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={showEditUsernameModal}>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios" >
              <IonButtons style={{ marginLeft: "-2.5%" }}>
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  onClick={() => {
                    Keyboard.hide().then(() => {
                      setTimeout(() => setShowEditUsernameModal(false), 100);
                    }).catch((err) => {
                      setTimeout(() => setShowEditUsernameModal(false), 100);
                    });
                    if (user && user.displayName) { setEditableUsername(user.displayName); }
                  }}
                >
                  <IonIcon icon={chevronBackOutline}></IonIcon> Back
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton mode="ios" color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} fill="clear" disabled={!aboutEdit} onClick={handleUserCheckmark}>Save</IonButton>
              </IonButtons>
            </IonToolbar>
          </div>
          <br />
          <IonItem mode="ios">
            <IonInput
              mode="ios"
              style={{ width: "75vw" }}
              ref={inputUserRef}
              readonly={false}
              value={editableUsername}
              onIonChange={(e) => {
                handleChangeUsernameString(e);
              }}
            ></IonInput>
          </IonItem>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={credentialsModal}>
          <div className="ion-modal">
            <IonHeader mode="ios">
              <IonTitle color="secondary" class="ion-title">
                {" "}
                <div>Email Change</div>{" "}
              </IonTitle>
            </IonHeader>
            <div>
              <br></br>
            </div>
            <IonList inset={true} mode="ios" className="sign-in-sign-up-list">
              <IonItem key="singleton_item" mode="ios" class="ion-item-style">
                <IonInput
                  color="transparent"
                  mode="ios"
                  clearOnEdit={false}
                  value={passwordReAuth}
                  type="password"
                  placeholder="Enter your password again..."
                  id="passwordSignIn"
                  onIonChange={(e: any) => setPasswordReAuth(e.detail.value)}
                ></IonInput>
              </IonItem>
              <br />
              <IonButton
                color="danger"
                mode="ios"
                onClick={() => {
                  Keyboard.hide().then(() => {
                    setTimeout(() => setCredentialsModal(false), 100);
                  }).catch((err) => {
                    setTimeout(() => setCredentialsModal(false), 100);
                  });
                  setEditableEmail(email);
                }}
                fill="clear"
                id="cancelButton"
              >
                Cancel
              </IonButton>
              <IonButton
                color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                mode="ios"
                onClick={handleEmailChange}
                fill="clear"
                id="signInButton"
              >
                Authenticate
              </IonButton>
              <br />
              <br />
            </IonList>
          </div>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={credentialsUserModal}>
          <div className="ion-modal">
            <IonHeader mode="ios">
              <IonTitle color="secondary" class="ion-title">
                {" "}
                <div>Username Change</div>{" "}
              </IonTitle>
            </IonHeader>
            <div>
              <br></br>
            </div>
            <IonList inset={true} mode="ios" className="sign-in-sign-up-list">
              <IonItem key="singleton_item_2" mode="ios" class="ion-item-style">
                <IonInput
                  color="transparent"
                  mode="ios"
                  clearOnEdit={false}
                  value={passwordReAuth}
                  type="password"
                  placeholder="Enter your password again..."
                  id="passwordSignIn"
                  onIonChange={(e: any) => setPasswordReAuth(e.detail.value)}
                ></IonInput>
              </IonItem>
              <br />
              <IonButton
                color="danger"
                mode="ios"
                onClick={() => {
                  Keyboard.hide().then(() => {
                    setTimeout(() => setCredentialsUserModal(false), 100);
                  }).catch((err) => {
                    setTimeout(() => setCredentialsUserModal(false), 100);
                  });
                  setEditableUsername(username);
                  setPasswordReAuth("");
                }}
                fill="clear"
                id="cancelButton"
              >
                Cancel
              </IonButton>
              <IonButton
                color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                mode="ios"
                fill="clear"
                onClick={handleUsernameChange}
                id="signInButton"
              >
                Authenticate
              </IonButton>
              <br />
              <br />
            </IonList>
          </div>
        </IonModal>
        <Swiper
          pagination={{ dynamicBullets: true }}
          modules={[Pagination]}
          slidesPerView={1}
          onSlideChange={(e) => {
            scrollToTop();
            switch (e.realIndex) {
              case 0:
                break;
              case 1:
                if (!loadedSlidesArr[1]) {
                  let tempArr: boolean[] = loadedSlidesArr;
                  tempArr[1] = true;
                  setLoadedSlidesArr(tempArr);
                  loadNotifications();
                }
                break;
              case 2:
                if (!loadedSlidesArr[2]) {
                  let tempArr: boolean[] = loadedSlidesArr;
                  tempArr[2] = true;
                  setLoadedSlidesArr(tempArr);
                  loadUserPosts();
                }
                break;
              case 3:
                if (!loadedSlidesArr[3]) {
                  let tempArr: boolean[] = loadedSlidesArr;
                  tempArr[3] = true;
                  setLoadedSlidesArr(tempArr);
                  loadUserLikes();
                }
                break;
              case 4:
                if (!loadedSlidesArr[4]) {
                  let tempArr: boolean[] = loadedSlidesArr;
                  tempArr[4] = true;
                  setLoadedSlidesArr(tempArr);
                  loadYourPolls();
                }
                break;
              default:
                break;
            }
          }}
        >
          <SwiperSlide>
            <br />
            <IonHeader
              class="ion-no-border"
              style={{
                textAlign: "center",
                fontSize: "1em",
                color: "#898989"
              }}
            >
              Settings
              <FadeIn delay={500} transitionDuration={1500}>
                <IonFab horizontal="end">
                  <div>
                    <IonNote>Swipe &nbsp;</IonNote>
                    <IonIcon icon={arrowForward} />
                  </div>
                </IonFab>
              </FadeIn>
            </IonHeader>
            <IonCard className="user-card">
              <IonContent>
                <IonList mode="ios" inset={true}>
                  <IonItem key="singleton_item_3" mode="ios">
                    <IonGrid>
                      <IonRow>
                        <IonLabel mode="ios">
                          <IonText color="medium">
                            <p> Email </p>
                          </IonText>
                          {/* <IonInput
                      style={{ width: "60vw" }}
                      ref={inputRef}
                      readonly={false}
                      value={editableEmail}
                      onIonChange={(e) => {
                        handleChangeEmailString(e);
                      }}
                    ></IonInput> */}
                        </IonLabel>
                      </IonRow>
                      <IonRow>
                        <p>{editableEmail}</p>
                      </IonRow>
                    </IonGrid>
                    <IonButton
                      onClick={handleEdit}
                      color="medium"
                      slot="end"
                    >
                      {" "}
                      Edit{" "}
                    </IonButton>
                  </IonItem>
                  <IonItem mode="ios">
                    <IonGrid>
                      <IonRow>
                        <IonLabel mode="ios">
                          <IonText color="medium">
                            <p> Username </p>
                          </IonText>
                          {/* <IonInput
                      maxlength={15}
                      ref={inputUserRef}
                      readonly={false}
                      value={editableUsername}
                      onIonChange={(e) => {
                        handleChangeUsernameString(e);
                      }}
                    ></IonInput> */}
                        </IonLabel>
                      </IonRow>
                      <IonRow>
                        <p>{editableUsername}</p>
                      </IonRow>
                    </IonGrid>
                    <IonButton
                      onClick={handleUserEdit}
                      color="medium"
                      slot="end"
                    >
                      {" "}
                      Edit{" "}
                    </IonButton>
                  </IonItem>
                  <IonItem mode="ios">
                    <IonGrid>
                      <IonRow>
                        <IonLabel mode="ios">
                          <IonText color="medium">
                            <p> About </p>
                          </IonText>
                        </IonLabel>
                      </IonRow>
                      <IonRow>
                        <p>...</p>
                      </IonRow>
                    </IonGrid>
                    <IonButton
                      color="medium"
                      slot="end"
                      onClick={() => { handleEditAbout(); }}
                    >
                      Edit
                    </IonButton>
                  </IonItem>
                  <IonItem mode="ios">
                    <p> Dark mode </p>
                    <IonIcon color="medium" icon={moon} slot="end" />
                    <IonToggle
                      color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                      slot="end"
                      name="darkMode"
                      checked={darkModeToggled}
                      onIonChange={(e) => { toggleDarkModeHandler(e.detail.checked); Haptics.impact({ style: ImpactStyle.Light }); }}
                    />
                  </IonItem>
                  {schoolName === "Cal Poly Humboldt" &&
                    <IonItem mode="ios">
                      <p> School Color Palette </p>
                      <IonIcon color="medium" icon={colorFill} slot="end" />
                      <IonToggle
                        color={schoolName === "Cal Poly Humboldt" ? "tertiary" : "primary"}
                        slot="end"
                        name="schoolColorToggle"
                        checked={schoolColorToggled}
                        onIonChange={(e) => { toggleSchoolColorPallete(e.detail.checked); Haptics.impact({ style: ImpactStyle.Light }); }}
                      />
                    </IonItem>
                  }
                  <IonItem mode="ios">
                    <p> Hide Sensitive Content</p>
                    <IonIcon color="medium" icon={warningSharp} slot="end" />
                    <IonToggle
                      color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                      slot="end"
                      name="sensitiveContent"
                      checked={sensitiveToggled}
                      onIonChange={(e) => { toggleSensitiveContent(e.detail.checked); Haptics.impact({ style: ImpactStyle.Light }); }}
                    />
                  </IonItem>
                </IonList>
                <br /> <br /><br /> <br /><br /> <br />
              </IonContent>
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <br />
            <IonHeader
              class="ion-no-border"
              style={{
                textAlign: "center",
                fontSize: "1em",
                color: "#898989"
              }}
            >
              Notifications
              <IonFab horizontal="end">
                <IonButton fill="clear" mode="ios" onClick={loadNotifications} color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}>
                  <IonIcon icon={refreshOutline} />
                </IonButton>
              </IonFab>
            </IonHeader>
            <IonCard className="user-card">
              <IonContent>
                <div>
                  <>
                    {!notifs ?
                      <div style={{ textAlign: "center" }}>
                        <IonSpinner color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} />
                      </div>
                      : notifs.length > 0 ?
                        <>
                          {notifs.slice(0).reverse().map((notif, index) => {
                            if ("message" in notif && "chatroomString" in notif) {
                              return (
                                <FadeIn key={"notif_" + notif.postKey + index.toString()}>
                                  <IonList inset={true} mode="ios">
                                    <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate(notif.chatroomString, "forward"); }}>
                                      <IonFab horizontal="end" vertical="top">
                                        <IonNote style={{ fontSize: "0.75em" }}>
                                          {" "}
                                          {getDate(notif.date)}{" "}
                                        </IonNote>
                                      </IonFab>
                                      <IonText>
                                        <div style={{ height: "4vh" }}>{" "}</div>
                                        <div style={{ fontWeight: "bold" }}>
                                          {notif.userName + " sent a DM: "}
                                        </div>
                                        {notif.message}
                                        <div style={{ height: "1vh" }}>{" "}</div>
                                      </IonText>
                                    </IonItem>
                                  </IonList>
                                </FadeIn>
                              )
                            } else {
                              return (
                                <FadeIn key={"notif_" + notif.postKey + index.toString()}>
                                  <IonList inset={true} mode="ios">
                                    <IonItem lines="none" mode="ios" onClick={() => { const key = notif.postKey.toString(); dynamicNavigate("post/" + key, "forward"); }}>
                                      <IonFab horizontal="end" vertical="top">
                                        <IonNote style={{ fontSize: "0.75em" }}>
                                          {" "}
                                          {getDate(notif.date)}{" "}
                                        </IonNote>
                                      </IonFab>
                                      <IonText>
                                        <div style={{ height: "4vh" }}>{" "}</div>
                                        <div style={{ fontWeight: "bold" }}>
                                          {notif.userName + " commented: "}
                                        </div>
                                        {notif.comment}
                                        <div style={{ height: "1vh" }}>{" "}</div>
                                      </IonText>
                                    </IonItem>
                                  </IonList>
                                </FadeIn>
                              )
                            }
                          })}
                        </>
                        : null
                    }
                  </>
                </div>
                <br /> <br /><br /> <br /><br /> <br />
              </IonContent>
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <br />
            <IonHeader
              class="ion-no-border"
              style={{
                textAlign: "center",
                fontSize: "1em",
                color: "#898989"
              }}
            >
              Your Posts
              <IonFab horizontal="end">
                <IonButton mode="ios" fill="clear" onClick={loadUserPosts} color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}>
                  <IonIcon icon={refreshOutline} />
                </IonButton>
              </IonFab>
            </IonHeader>
            <IonCard className="user-card">
              <IonContent>
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
                                    <IonFab horizontal="start">
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
                                        marginLeft: "2%",
                                        marginTop: "5%",
                                      }}
                                    >
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
                              <IonItem lines="none" mode="ios" onClick={() => { dynamicNavigate("post/" + post.key, "forward"); }}>
                                <IonLabel>
                                  <IonFab horizontal="end">
                                    <IonNote style={{ fontSize: "0.75em" }}>
                                      {" "}
                                      {getDate(post.timestamp)}{" "}
                                    </IonNote>
                                  </IonFab>
                                  <IonFab horizontal="start" style={{ marginLeft: '-1.5%' }}>
                                    {post.postType != "general" ? (
                                      <p
                                        style={{
                                          fontWeight: "bold",
                                          color: getColor(post.postType),
                                        }}
                                      >
                                        {post.postType.toUpperCase()}
                                      </p>
                                    ) : null}
                                  </IonFab>
                                  <br></br><br />
                                  {"className" in post && "classNumber" in post && post.className.length > 0 ?
                                    <Linkify tagName="h3" className="h2-message">
                                      {post.message} <IonNote onClick={(e) => {
                                        e.stopPropagation();
                                        dynamicNavigate("class/" + post.className, 'forward');
                                      }} color="medium" style={{ fontWeight: "400" }}> &nbsp; — {post.className}{post.classNumber}</IonNote>
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
                                                  title: true
                                                },
                                                startFrom: 0
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
                                                startFrom: 0
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
                                        <div
                                          className="ion-img-container"
                                          style={{ backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '10px' }}
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
                                              startFrom: 2
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
                                        index >= 0 &&
                                        index < userPosts.length &&
                                        "likes" in userPosts[index] &&
                                        userPosts[index].likes[user.uid] !== undefined &&
                                        schoolName !== "Cal Poly Humboldt"
                                        ? "primary"
                                        : userPosts &&
                                          user &&
                                          index >= 0 &&
                                          index < userPosts.length &&
                                          "likes" in userPosts[index] &&
                                          userPosts[index].likes[user.uid] !== undefined &&
                                          schoolName === "Cal Poly Humboldt" && schoolColorToggled
                                          ? "tertiary"
                                          : userPosts &&
                                            user &&
                                            index >= 0 &&
                                            index < userPosts.length &&
                                            "likes" in userPosts[index] &&
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
                                      dynamicNavigate("post/" + post.key, "forward");
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
                                        "dislikes" in userPosts[index] &&
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
                                  <IonFab horizontal="end">
                                    <IonButton
                                      disabled={disabledDeleteButton}
                                      mode="ios"
                                      fill="outline"
                                      color="danger"
                                      onClick={() => {
                                        if ("url" in post && post.url && post.url.length > 0) {
                                          deletePost(index, post.key, post.url);
                                        } else {
                                          deletePost(index, post.key, []);
                                        }
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IonButton>
                                  </IonFab>
                                </IonItem>
                              </FadeIn>
                            </IonList>
                          </FadeIn>
                        );
                      })
                      : <p style={{ fontWeight: "bold", textAlign: "center" }}>No posts yet!</p>
                    }
                  </>
                  {loadingUserPosts ? (
                    <div style={{ textAlign: "center" }}>
                      <IonSpinner color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} />
                    </div>
                  ) : (
                    null
                  )}
                  {userPosts && userPosts.length > 10 &&
                    <FadeIn>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <IonButton
                          color="medium"
                          mode="ios"
                          fill="outline"
                          expand="block"
                          disabled={!userPosts || loadingUserPosts || noMorePosts}
                          onClick={() => {
                            fetchMorePosts();
                          }}
                        >
                          LOAD MORE POSTS{" "}
                        </IonButton>
                      </div>
                    </FadeIn>
                  }
                </div>
                <br /> <br /><br /> <br /><br /> <br />
              </IonContent>
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <br />
            <IonHeader
              class="ion-no-border"
              style={{
                textAlign: "center",
                fontSize: "1em",
                color: "#898989"
              }}
            >
              Liked Posts
              <IonFab horizontal="end">
                <IonButton mode="ios" fill="clear" onClick={loadUserLikes} color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}>
                  <IonIcon icon={refreshOutline} />
                </IonButton>
              </IonFab>
            </IonHeader>
            <IonCard className="user-card">
              <IonContent>
                <div>
                  {userLikedPosts ? (
                    <FadeIn>
                      {userLikedPosts.map((post, index) => {
                        return (
                          <IonList key={post.key} mode="ios" lines="none" inset>
                            <IonItem onClick={() => { dynamicNavigate("post/" + post.key, "forward"); }} mode="ios">
                              <IonLabel>
                                <IonText color="medium">
                                  <IonRow>
                                    <IonCol size="6">
                                      <IonAvatar
                                        class="posts-avatar"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dynamicNavigate("about/" + post.uid, "forward");
                                        }}
                                      >
                                        <ProfilePhoto uid={post.uid}></ProfilePhoto>
                                      </IonAvatar>
                                      <p>
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
                                <h3
                                  className="h2-message"
                                  style={{
                                    marginLeft: "2%",
                                    marginTop: "5%",
                                  }}
                                >
                                  {post.message}
                                </h3>
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
                                                title: true
                                              },
                                              startFrom: 0
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
                                              startFrom: 0
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
                                      <div
                                        className="ion-img-container"
                                        style={{ backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '10px' }}
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
                                            startFrom: 2
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
                        )
                      })}
                    </FadeIn>
                  ) :
                    <IonSpinner color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} className='ion-spinner'></IonSpinner>
                  }
                  {userLikedPosts && userLikedPosts.length <= 0 ? (
                    <p style={{ fontWeight: "bold", textAlign: "center" }}>No likes yet!</p>
                  ) : (null)}
                  {userLikedPosts && userLikedPosts.length > 10 &&
                    <FadeIn>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <IonButton
                          disabled={!userLikedPosts || noMoreLikes}
                          color="medium"
                          mode="ios"
                          fill="outline"
                          expand="block"
                          onClick={() => {
                            fetchMoreLikes();
                          }}
                        >
                          LOAD MORE LIKES{" "}
                        </IonButton>
                      </div>
                    </FadeIn>
                  }
                </div>
                <br /> <br /><br /> <br /><br /> <br />
              </IonContent>
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <br />
            <IonHeader
              class="ion-no-border"
              style={{
                textAlign: "center",
                fontSize: "1em",
                color: "#898989"
              }}
            >
              Your Polls
              <IonFab horizontal="end">
                <IonButton mode="ios" fill="clear" onClick={loadYourPolls} color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}>
                  <IonIcon icon={refreshOutline} />
                </IonButton>
              </IonFab>
            </IonHeader>
            <IonCard className="user-card">
              <IonContent>
                <div>
                  <div>
                    {user && yourPolls ? (
                      <FadeIn>
                        {yourPolls.map((poll, index) => {
                          return (
                            <IonCard mode='ios' key={poll.key}>
                              <IonCardContent style={{ minHeight: "52.5vh" }}>
                                <p>{poll.userName}</p>
                                <IonCardTitle style={{ fontSize: "1.5em" }}>{poll.question}</IonCardTitle>
                                <br />
                                <IonList lines="full" mode="ios">
                                  {poll.options.map((option: any, index: number) => {
                                    return (
                                      <IonItem style={{ fontWeight: "bold" }} disabled={true} key={option.text + index.toString()} mode="ios" lines="full">
                                        {option.text} <p slot="end">{!isNaN(Math.round(((poll.results[index] / poll.votes) * 100) * 10) / 10) ? (Math.round(((poll.results[index] / poll.votes) * 100) * 10) / 10) + "%" : ('0') + "%"}</p>
                                      </IonItem>
                                    )
                                  })}
                                </IonList>
                                <IonFab vertical="bottom" horizontal="start" style={{ marginBottom: "-1vh" }}>
                                  <p>{poll.votes} Votes &#183; {getTimeLeft(poll.timestamp)} days left</p>
                                </IonFab>
                                <IonFab vertical='bottom' horizontal="end" style={{ marginBottom: "-1vh" }}>
                                  <IonButton
                                    size="small"
                                    disabled={disabledDeleteButton}
                                    mode="ios"
                                    fill="outline"
                                    color="danger"
                                    onClick={() => {
                                      deletePoll(index, poll.key)
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IonButton>
                                </IonFab>
                              </IonCardContent>
                            </IonCard>
                          )
                        })}
                      </FadeIn>) : (<IonSpinner color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} className="ion-spinner" />)}
                  </div>
                  {yourPolls && yourPolls.length <= 0 ? (
                    <p style={{ fontWeight: "bold", textAlign: "center" }}>No polls yet!</p>
                  ) : (null)}
                </div>
                <br /> <br /><br /> <br /><br /> <br />
              </IonContent>
            </IonCard>
          </SwiperSlide>
        </Swiper>
      </IonContent>
    </IonPage >
  );
}

export default React.memo(User);
