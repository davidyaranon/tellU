import {
  IonHeader,
  IonContent,
  IonLoading,
  IonButton,
  IonInput,
  IonFab,
  IonTextarea,
  IonImg,
  IonAvatar,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonModal,
  IonToggle,
  IonText,
  IonCardContent,
  IonCard,
  IonSkeletonText,
  IonNote,
  IonSpinner,
  IonButtons,
  IonCardTitle,
  IonPage,
  useIonViewDidEnter,
  IonRow,
  IonCol,
  IonGrid,
} from "@ionic/react";
import React, { useRef, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  storage,
  logout,
  db,
  promiseTimeout,
  checkUsernameUniqueness,
  uploadImage,
  getUserPosts,
  upVote,
  downVote,
  getNextBatchUserPosts,
  removePost,
  getUserLikedPostsNextBatch,
  getUserLikedPosts,
  getYourPolls,
  pollVote,
  updateUserInfo,
  getCurrentUserData,
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
import { cameraReverseOutline, logoInstagram, logoSnapchat, logoTiktok, moon } from "ionicons/icons";
import { updateEmail } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setDarkMode } from "../redux/actions";
import FadeIn from "react-fade-in";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { informationCircleOutline, arrowBack } from "ionicons/icons";
import ForumIcon from "@mui/icons-material/Forum";
import {
  Keyboard,
  KeyboardStyle,
  KeyboardStyleOptions,
} from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";
import { getColor, timeout } from '../components/functions';
import UIContext from "../my-context";

function User() {
  const timeAgo = new TimeAgo("en-US");
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const { setShowTabs } = React.useContext(UIContext);
  const Toast = useToast();
  const [voteBeingCasted, setVoteBeingCasted] = useState<boolean>(false);
  const dispatch = useDispatch();
  const schoolName = useSelector((state: any) => state.user.school);
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
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
  const [credentialsUserModal, setCredentialsUserModal] =
    useState<boolean>(false);
  const [loadingUserPosts, setLoadingUserPosts] = useState<boolean>(false);
  const [yourPolls, setYourPolls] = useState<any[]>([]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [busy, setBusy] = useState<boolean>(false);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const history = useHistory();
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
  const emojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

  const titleStyle = {
    fontSize: "6.5vw",
  };

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

  const handleEditAbout = () => {
    if (user && user.uid) {
      if (!userDataHasLoaded) {
        const gotUserData = promiseTimeout(7500, getCurrentUserData());
        gotUserData.then((res: any) => {
          if(res){
            setUserBio(res.bio);
            setUserMajor(res.major);
            setUserInstagram(res.instagram);
            setUserSnapchat(res.snapchat);
            setUserTiktok(res.tiktok);
            setEditableUserBio(res.bio);
            setEditableUserMajor(res.major);
            setEditableUserInstagram(res.instagram);
            setEditableUserSnapchat(res.snapchat);
            setEditableUserTiktok(res.tiktok);
          } else {
            Toast.error("Trouble loading data");
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
      });
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
    }
  }

  const handleUpdateAboutUser = async () => {
    setUserDataHasLoaded(false);
    if(editableUserBio.trim() == userBio.trim() 
    && editableUserInstagram.trim() == userInstagram.trim()
    && editableUserSnapchat.trim() == userSnapchat.trim()
    && editableUserMajor.trim() == userMajor.trim()
    && editableUserTiktok.trim() == userTiktok.trim()){
      Toast.error("No changes made");
      setUserDataHasLoaded(true);
      return;
    }
    let userDataUpdated = promiseTimeout(10000, updateUserInfo(editableUserBio, editableUserInstagram, editableUserMajor, editableUserSnapchat, editableUserTiktok));
    userDataUpdated.then((res) => {
      if(res){
        setUserBio(editableUserBio);
        setUserSnapchat(editableUserSnapchat);
        setUserInstagram(editableUserInstagram);
        setUserTiktok(editableUserTiktok);
        setUserMajor(editableUserMajor);
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
  };

  const deletePost = async (index: number, postUrl: string) => {
    setDisabledDeleteButton(true);
    if (userPosts && userPosts.length > 0 && schoolName && index >= 0 && index <= userPosts.length) {
      const postBeingDeleted = userPosts[index];
      const didDelete = promiseTimeout(10000, removePost(postBeingDeleted.key, schoolName, postUrl));
      didDelete.then((res) => {
        if (res) {
          Toast.success("Post deleted");
          let tempPosts: any[] = [];
          for (let i = 0; i < userPosts.length; ++i) {
            if (i !== index) {
              tempPosts.push(userPosts[i]);
            }
          }
          setUserPosts(tempPosts);
        } else {
          Toast.error("Unable to delete post rn");
        }
        setDisabledDeleteButton(false);
      });
      didDelete.catch((err) => {
        Toast.error(err);
        setDisabledDeleteButton(false);
      });
    } else {
      Toast.error("Unable to delete post rn");
    }
    setDisabledDeleteButton(false);
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

  async function handleUsernameChange() {
    // update all messages to include updated username + include duplicate username check
    setCredentialsUserModal(false);
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
                  setCredentialsUserModal(false);
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

  // const handleCommentModal = async (post: any, postIndex: number) => {
  //   setCommentsLoading(true);
  //   setCommentModalPostIndex(postIndex);
  //   setCommentModalPostDownvotes(Object.keys(post.dislikes).length);
  //   setCommentModalPostUpvotes(Object.keys(post.likes).length);
  //   setCommentModalPost(post);
  //   setShowCommentModal(true);
  //   try {
  //     // load comments from /schoolPosts/{schoolName}/comments/{post.key}
  //     const resComments = await loadComments(post.key, schoolName);
  //     if (resComments != null && resComments != undefined) {
  //       //console.log(resComments);
  //       setComments(resComments);
  //       setCommentsLoading(false);
  //     } else {
  //       //console.log(resComments);
  //       Toast.error(
  //         "Unable to load comments"
  //       );
  //     }
  //   } catch (err: any) {
  //     console.log(err);
  //     Toast.error(err.message.toString());
  //   }
  // };

  async function handleEmailChange() {
    setBusy(true);
    if (user && user.email) {
      if (user.email == editableEmail) {
        Toast.error("No changes made");
        setBusy(false);
        setCredentialsModal(false);
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
                      setCredentialsModal(false);
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
    const val = await upVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
        tempPosts[index].upVotes += val;
        // setCommentModalPostUpvotes(commentModalPostUpvotes + val);
        if (tempPosts[index].likes[user.uid]) {
          delete tempPosts[index].likes[user.uid];
        } else {
          if (tempPosts[index].dislikes[user.uid]) {
            delete tempPosts[index].dislikes[user.uid];
            tempPosts[index].downVotes -= 1;
            // setCommentModalPostDownvotes(commentModalPostDownvotes - 1);
          }
          tempPosts[index].likes[user.uid] = true;
        }
        setUserPosts(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to like post :(");
    }
  };

  const handleDownVote = async (postKey: string, index: number, post: any) => {
    const val = await downVote(schoolName, postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
        // setCommentModalPostDownvotes(commentModalPostDownvotes + val);
        tempPosts[index].downVotes += val;
        if (tempPosts[index].dislikes[user.uid]) {
          delete tempPosts[index].dislikes[user.uid];
        } else {
          if (tempPosts[index].likes[user.uid]) {
            delete tempPosts[index].likes[user.uid];
            tempPosts[index].upVotes -= 1;
            // setCommentModalPostUpvotes(commentModalPostUpvotes - 1);
          }
          tempPosts[index].dislikes[user.uid] = true;
        }
        setUserPosts(tempPosts);
        await timeout(1000).then(() => {
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
    return (7 - (Math.floor(ms / (1000 * 60 * 60 * 24)))) > 0 ? (7 - (Math.floor(ms / (1000 * 60 * 60 * 24)))).toString() : '0';
  }

  const fetchMorePosts = () => {
    if (lastKey && user) {
      getNextBatchUserPosts(schoolName, user.uid, lastKey)
        .then((res: any) => {
          setLastKey(res.lastKey);
          setUserPosts(userPosts?.concat(res.userPosts)!);
          if (res.userPosts.length == 0) {
            setNoMorePosts(true);
          }
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
  }


  const handlePollVote = async (index: number, pollKey: string) => {
    if (user && schoolName) {
      setVoteBeingCasted(true);
      const castedVote = promiseTimeout(5000, pollVote(schoolName, index, pollKey, user.uid));
      castedVote.then((res) => {
        if (res) {
          Toast.success("Vote casted!");
          const pollsLoaded = promiseTimeout(10000, getYourPolls(schoolName, user.uid));
          pollsLoaded.then((res) => {
            setYourPolls(res);
            setVoteBeingCasted(false);
          });
          pollsLoaded.catch((err) => {
            Toast.error(err + "\n Check your internet connection");
          });
        } else {
          Toast.error("Something went wrong when casting vote");
        }
      });
      castedVote.catch((err) => {
        Toast.error(err + '\n Check your internet connection');
      });
    } else {
      Toast.error("Something went wrong when casting a vote");
    }
  }

  // const isEnterPressed = (key: any) => {
  //   if (key === "Enter") {
  //     Keyboard.hide().then(() => { handleCommentSubmit(commentModalPost.key) });
  //   }
  // };

  async function loadLogout() {
    let promise = promiseTimeout(10000, logout());
    promise.then((loggedOut: any) => {
      if (loggedOut == "true") {
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
    let currMajor= e.detail.value;
    setEditableUserMajor(currMajor);
  };
  const handleUserTiktokChange = (e: any) => {
    let curr= e.detail.value;
    setEditableUserTiktok(curr);
  };
  const handleUserSnapchatChange = (e: any) => {
    let curr = e.detail.value;
    setEditableUserSnapchat(curr);
  };
  const handleUserInstagramChange = (e: any) => {
    let curr= e.detail.value;
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

  const loadUserPosts = () => {
    setLoadingUserPosts(true);
    if (schoolName && user) {
      const hasLoaded = promiseTimeout(
        5000,
        getUserPosts(schoolName, user.uid)
      );
      hasLoaded.then((res) => {
        if (res.userPosts.length > 0) {
          //console.log(res.userPosts);
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

  useIonViewDidEnter(() => {
    scrollToTop();
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
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (!loading && user) {
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
        setBusy(false);
      }
      return () => { };
    }
  }, [user]);

  if (loading) {
    return (
      <IonLoading
        message="Please wait..."
        duration={0}
        isOpen={busy}
      ></IonLoading>
    );
  }
  return (
    <IonPage>
      <IonContent ref={contentRef}>
        {/* <IonHeader class="ion-no-border" style={{ textAlign: "center" }}> */}
        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonButton
              // style={{opacity: "40%"}}
              // disabled
              onClick={loadLogout}
              color="danger"
              mode="ios"
              fill="outline"
              id="logout"
            >
              Logout
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                history.push("/privacy-policy");
              }}
            >
              <IonIcon icon={informationCircleOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonHeader mode="ios" class="ion-no-border" style={{ textAlign: "center" }}>
          <IonToolbar mode="ios">
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
          </IonToolbar>
        </IonHeader>
        <FadeIn>
          <IonToolbar mode="ios">
            <IonTitle size="small" style={titleStyle}>
              Hello
              <IonText color="primary">&nbsp;{editableUsername}</IonText>
            </IonTitle>
          </IonToolbar>
        </FadeIn>
        {/* </IonHeader> */}
        <IonLoading
          message="Please wait..."
          duration={0}
          isOpen={busy}
        ></IonLoading>

        <IonModal backdropDismiss={false} isOpen={showAboutModal}>
          <IonContent>
            <div slot="fixed" style={{ width: "100%" }}>
              <IonToolbar mode="ios" >
                <IonButtons slot="start">
                  <IonButton
                    mode="ios"
                    onClick={() => {
                      setShowAboutModal(false);
                      setEditableUserBio(userBio);
                      setEditableUserInstagram(userInstagram);
                      setEditableUserMajor(userMajor);
                      setEditableUserTiktok(userTiktok);
                      setEditableUserSnapchat(userSnapchat);
                    }}
                  >
                    Back
                  </IonButton>
                </IonButtons>
                <IonButtons slot="end">
                  <IonButton
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
                  style={{fontWeight:"bold"}}
                  rows={4}
                  mode="ios"
                  id="bio"
                  color="primary"
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
                  style={{fontWeight:"bold"}}
                  mode="ios"
                  id="major"
                  color="primary"
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
                  style={{fontWeight:"bold"}}
                  mode="ios"
                  id="bio"
                  color="primary"
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
                  style={{fontWeight:"bold"}}
                  mode="ios"
                  id="bio"
                  color="primary"
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
                  style={{fontWeight:"bold"}}
                  mode="ios"
                  id="bio"
                  color="primary"
                  maxlength={50}
                  value={editableUserTiktok}
                  onIonChange={(e: any) => {
                    handleUserTiktokChange(e);
                  }}
                />
              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={showEditEmailModal}>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios" >
              <IonButtons slot="start">
                <IonButton
                  mode="ios"
                  onClick={() => {
                    setShowEditEmailModal(false);
                    if (user && user.email) { setEditableEmail(user.email); }
                  }}
                >
                  <IonIcon icon={arrowBack}></IonIcon> Back
                </IonButton>
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
          <IonButton mode="ios" color="primary" fill="outline" onClick={handleCheckmark}>Change</IonButton>
        </IonModal>

        <IonModal backdropDismiss={false} isOpen={showEditUsernameModal}>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios" >
              <IonButtons slot="start">
                <IonButton
                  mode="ios"
                  onClick={() => {
                    setShowEditUsernameModal(false);
                    if (user && user.displayName) { setEditableUsername(user.displayName); }
                  }}
                >
                  <IonIcon icon={arrowBack}></IonIcon> Back
                </IonButton>
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
          <IonButton mode="ios" color="primary" fill="outline" onClick={handleUserCheckmark}>Change</IonButton>
        </IonModal>

        {/* <IonModal backdropDismiss={false} isOpen={showCommentModal}>
          <IonContent>
            <div slot="fixed" style={{ width: "100%" }}>
              <IonToolbar mode="ios" >
                <IonButtons slot="start">
                  <IonButton
                    mode="ios"
                    onClick={() => {
                      setShowCommentModal(false);
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
                enterkeyhint="send"
                rows={3}
                style={{ width: "95vw", height: "10vh", marginLeft: "2.5vw" }}
                color="secondary"
                spellcheck={true}
                maxlength={200}
                value={comment}
                // inputMode="text"
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
                                // setComments([]);
                                // setShowCommentModal(false);
                                // setComment("");
                              }}
                              class="posts-avatar"
                            >
                              <IonImg src={commentModalPost.photoURL}></IonImg>
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
                      <div id={commentModalPost.postType}></div>
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
                        disabled={disabledLikeButtons === commentModalPostIndex}
                        mode="ios"
                        fill="outline"
                        color={
                          userPosts &&
                            user &&
                            commentModalPostIndex >= 0 &&
                            commentModalPostIndex < userPosts.length &&
                            "likes" in userPosts[commentModalPostIndex] &&
                            userPosts[commentModalPostIndex].likes[user.uid] !==
                            undefined
                            ? "primary"
                            : "medium"
                        }
                        onClick={() => {
                          setLikeAnimation(commentModalPostIndex);
                          setDisabledLikeButtons(commentModalPostIndex);
                          handleUpVote(
                            commentModalPost.key,
                            commentModalPostIndex,
                            commentModalPost
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
                        disabled={disabledLikeButtons === commentModalPostIndex}
                        mode="ios"
                        fill="outline"
                        color={
                          userPosts &&
                            user &&
                            commentModalPostIndex >= 0 &&
                            commentModalPostIndex < userPosts.length &&
                            "dislikes" in userPosts[commentModalPostIndex] &&
                            userPosts[commentModalPostIndex].dislikes[user.uid] !==
                            undefined
                            ? "danger"
                            : "medium"
                        }
                        onClick={() => {
                          setDislikeAnimation(commentModalPostIndex);
                          setDisabledLikeButtons(commentModalPostIndex);
                          handleDownVote(
                            commentModalPost.key,
                            commentModalPostIndex,
                            commentModalPost
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
              ) : null}

              {commentsLoading && !comments ? (
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
                <div>
                  {comments && comments.length > 0
                    ? comments?.map((comment: any, index) => (
                      <IonList inset={true} key={index}>
                        {" "}
                        {/*dont do this, change index!
                        <IonItem lines="none">
                          <IonLabel class="ion-text-wrap">
                            <IonText color="medium">
                              {commentModalPost.uid != comment.uid ? (
                                <p>
                                  <IonAvatar
                                    onClick={() => {
                                      setShowCommentModal(false);
                                      handleUserPageNavigation(comment.uid);
                                    }}
                                    class="posts-avatar"
                                  >
                                    <IonImg src={comment?.photoURL!}></IonImg>
                                  </IonAvatar>
                                  {comment.userName}
                                </p>
                              ) : (
                                <p>
                                  <IonAvatar
                                    // onClick={() => {
                                    //   setComments([]);
                                    //   setShowCommentModal(false);
                                    //   setComment("");
                                    //   //handleUserPageNavigation(comment.uid);
                                    // }}
                                    class="posts-avatar"
                                  >
                                    <IonImg src={comment?.photoURL!}></IonImg>
                                  </IonAvatar>
                                  {comment.userName}
                                </p>
                              )}
                            </IonText>

                            <h2 className="h2-message">
                              {" "}
                              {comment.comment}{" "}
                            </h2>
                            {comment.url.length > 0 ? (
                                    <div className="ion-img-container">
                                      <br></br>
                                      <IonImg
                                        onClick={() => {
                                          showPicture(comment.imgSrc);
                                        }}
                                        src={comment.imgSrc}
                                      />
                                    </div>
                                  ) : null}
                          </IonLabel>
                          <div></div>
                        </IonItem>
                        <IonItem lines="none" mode="ios">
                          <IonButton disabled mode="ios" fill="outline" color="medium">
                            <KeyboardArrowUpIcon />
                            <p>{comment.upVotes} </p>
                          </IonButton>
                          <IonButton disabled mode="ios" fill="outline" color="medium">
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
              )}
              <div style={{ height: "25vh" }}>
                <p style={{ textAlign: "center" }}>&#183; </p>
              </div>
            </div>
          </IonContent>
          </IonModal> */}

        <IonModal backdropDismiss={false} isOpen={credentialsModal}>
          <div className="ion-modal">
            <IonHeader mode="ios">
              <IonTitle color="secondary" class="ion-title">
                {" "}
                <div>Re-Authentication for Email Change</div>{" "}
              </IonTitle>
            </IonHeader>
            <div>
              <br></br>
            </div>
            <IonList inset={true} mode="ios" className="sign-in-sign-up-list">
              <IonItem mode="ios" class="ion-item-style">
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
                  setCredentialsModal(false);
                  setEditableEmail(email);
                }}
                shape="round"
                fill="outline"
                id="cancelButton"
              >
                Cancel
              </IonButton>
              <IonButton
                color="transparent"
                mode="ios"
                onClick={handleEmailChange}
                shape="round"
                fill="outline"
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
                <div>Re-Authentication for Username Change</div>{" "}
              </IonTitle>
            </IonHeader>
            <div>
              <br></br>
            </div>
            <IonList inset={true} mode="ios" className="sign-in-sign-up-list">
              <IonItem mode="ios" class="ion-item-style">
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
                  setCredentialsUserModal(false);
                  setEditableUsername(username);
                  setPasswordReAuth("");
                }}
                shape="round"
                fill="outline"
                id="cancelButton"
              >
                Cancel
              </IonButton>
              <IonButton
                color="transparent"
                mode="ios"
                onClick={handleUsernameChange}
                shape="round"
                fill="outline"
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
                //loadNotifications();
                break;
              case 2:
                loadUserPosts();
                break;
              case 3:
                loadYourPolls();
                break;
              case 4:
                loadUserLikes();
                break;
              default:
                break;
            }
          }}
        >
          <SwiperSlide >
            <IonCard className="user-card">
              <IonHeader
                class="ion-no-border"
                style={{
                  padding: "2vh",
                  textAlign: "center",
                  fontSize: "1.25em",
                }}
              >
                Settings
              </IonHeader>
              <IonList mode="ios" inset={true}>
                <IonItem mode="ios">
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
                    disabled={false}
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
                    disabled={false}
                    onClick={handleUserEdit}
                    color="medium"
                    slot="end"
                  >
                    {" "}
                    Edit{" "}
                  </IonButton>
                </IonItem>
                {/* <IonItem mode="ios">
                  <p>Profile Picture</p>
                  <IonButton
                    onClick={handleProfilePictureEdit}
                    color="medium"
                    slot="end"
                  >
                    {" "}
                    Edit{" "}
                  </IonButton>
                </IonItem> */}
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
                    color="primary"
                    slot="end"
                    name="darkMode"
                    checked={darkModeToggled}
                    onIonChange={(e) => toggleDarkModeHandler(e.detail.checked)}
                  />
                </IonItem>
              </IonList>
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <IonCard className="user-card">
              <div>
                <IonHeader
                  class="ion-no-border"
                  style={{
                    textAlign: "center",
                    padding: "2vh",
                    fontSize: "1.25em",
                  }}
                >
                  Notifications
                </IonHeader>
                <IonList mode="ios"></IonList>
              </div>
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <IonCard className="user-card">
              <IonHeader
                class="ion-no-border"
                style={{
                  textAlign: "center",
                  padding: "2vh",
                  fontSize: "1.25em",
                }}
              >
                Your Posts
              </IonHeader>
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
                                      marginLeft: "2.5%",
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
                            <IonItem lines="none" mode="ios">
                              <IonLabel>
                                <IonFab horizontal="end">
                                  <IonNote style={{ fontSize: "0.75em" }}>
                                    {" "}
                                    {getDate(post.timestamp)}{" "}
                                  </IonNote>
                                </IonFab>
                                <IonFab horizontal="start">
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
                                <br></br>
                                <h3
                                  className="h2-message"
                                  style={{
                                    marginLeft: "4.5%",
                                    marginTop: "5%",
                                  }}
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
                                  <p>{Object.keys(post.likes).length} </p>
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
                                  <p>{Object.keys(post.dislikes).length} </p>
                                </IonButton>
                                <IonFab horizontal="end">
                                  <IonButton
                                    disabled={disabledDeleteButton}
                                    mode="ios"
                                    fill="outline"
                                    color="danger"
                                    onClick={() => {
                                      if ("url" in post && post.url && post.url.length > 0) {
                                        deletePost(index, post.url);
                                      } else {
                                        deletePost(index, "");
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
                    : null}
                </>
                {loadingUserPosts ? (
                  <div style={{ textAlign: "center" }}>
                    <IonSpinner color="primary" />
                  </div>
                ) : (
                  null
                )}
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
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <IonCard className="user-card">
              <div>
                <IonHeader
                  class="ion-no-border"
                  style={{
                    textAlign: "center",
                    padding: "2vh",
                    fontSize: "1.25em",
                  }}
                >
                  Your Polls
                </IonHeader>
                <div>
                  {user && yourPolls ? (
                    <>
                      {yourPolls.map((poll) => {
                        return (
                          <IonCard mode='ios' key={poll.key}>
                            <IonCardContent style={{ minHeight: "60vh" }}>
                              <p>{poll.userName}</p>
                              <IonCardTitle style={{ fontSize: "1.5em" }}>{poll.question}</IonCardTitle>
                              <br />
                              <IonList lines="full" mode="ios">
                                {poll.options.map((option: any, index: number) => {
                                  return (
                                    <IonItem style={{ fontWeight: "bold" }} disabled={true} color={poll.voteMap[user!.uid] === index ? "primary" : ""} key={index} mode="ios" lines="full">
                                      {option.text} <p slot="end">{!isNaN(Math.round(((poll.results[index] / poll.votes) * 100) * 10) / 10) ? (Math.round(((poll.results[index] / poll.votes) * 100) * 10) / 10) + "%" : ('0') + "%"}</p>
                                    </IonItem>
                                  )
                                })}
                              </IonList>
                              <IonFab vertical="bottom" horizontal="start">
                                <p>{poll.votes} Votes &#183; {getTimeLeft(poll.timestamp)} days left</p>
                              </IonFab>
                            </IonCardContent>
                          </IonCard>
                        )
                      })}
                    </>) : (<IonSpinner color="primary" className="ion-spinner" />)}
                </div>
                {yourPolls && yourPolls.length <= 0 ? (
                  <p style={{ fontWeight: "bold", textAlign: "center" }}>No polls yet!</p>
                ) : (null)}
              </div>
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <IonCard className="user-card">
              <div>
                <IonHeader
                  class="ion-no-border"
                  style={{
                    textAlign: "center",
                    padding: "2vh",
                    fontSize: "1.25em",
                  }}
                >
                  Liked Posts
                </IonHeader>
                {userLikedPosts ? (
                  <FadeIn>
                    <IonList mode="ios" lines="none" inset>
                      {userLikedPosts.map((post, index) => {
                        return (
                          <IonItem onClick={() => { history.push("home/post/" + post.key); }} key={post.key} mode="ios">
                            <IonLabel>
                              <IonText color="medium">
                                <IonRow>
                                  <IonCol size="6">
                                    <p>
                                      <IonAvatar
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
                              <h3
                                className="h2-message"
                                style={{
                                  marginLeft: "4.5%",
                                  marginTop: "5%",
                                }}
                              >
                                {" "}
                                {post.message}{" "}
                              </h3>
                              {post.imgSrc.length > 0 ? (
                                <div className="ion-img-container">
                                  <br></br>
                                  <IonImg
                                    className="ion-img-style"
                                    onClick={() => {
                                      PhotoViewer.show(post.imgSrc);
                                    }}
                                    src={post.imgSrc}
                                  />
                                </div>
                              ) : null}
                            </IonLabel>
                          </IonItem>
                        )
                      })}
                    </IonList>
                  </FadeIn>
                ) : (null)}
                {userLikedPosts && userLikedPosts.length <= 0 ? (
                  <p style={{ fontWeight: "bold", textAlign: "center" }}>No likes yet!</p>
                ) : (null)}
                <FadeIn>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <IonButton
                      disabled={noMoreLikes}
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
              </div>
            </IonCard>
          </SwiperSlide>
        </Swiper>
      </IonContent>
    </IonPage>
  );
}

export default React.memo(User);
