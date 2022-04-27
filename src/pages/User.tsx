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
} from "@ionic/react";
import React, { useRef, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  storage,
  logout,
  addMessage,
  db,
  promiseTimeout,
  checkUsernameUniqueness,
  uploadImage,
  getUserPosts,
  upVote,
  downVote,
  getNextBatchUserPosts,
  addComment,
  loadComments,
  removeComment,
  removePost,
  getUserLikedPosts,
  getUserLikedPostsNextBatch,
} from "../fbconfig";
import DeleteIcon from "@mui/icons-material/Delete";
import auth from "../fbconfig";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import {
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import Header, { ionHeaderStyle } from "./Header";
import "../App.css";
import { useHistory } from "react-router";
import { useToast } from "@agney/ir-toast";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { useSelector } from "react-redux";
import { moon } from "ionicons/icons";
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
import { cameraOutline, chatbubblesOutline, arrowBack } from "ionicons/icons";
import ForumIcon from "@mui/icons-material/Forum";
import {
  Keyboard,
  KeyboardStyle,
  KeyboardStyleOptions,
} from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";

function User() {
  const timeAgo = new TimeAgo("en-US");
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentModalPostIndex, setCommentModalPostIndex] =
    useState<number>(-1);
  const [commentModalPostUpvotes, setCommentModalPostUpvotes] =
    useState<number>(-1);
  const [commentModalPostDownvotes, setCommentModalPostDownvotes] =
    useState<number>(-1);
  const [commentModalPost, setCommentModalPost] = useState<any | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [commentsBusy, setCommentsBusy] = useState<boolean>(false);
  const [comments, setComments] = useState<any[] | null>(null);
  const [comment, setComment] = useState<string>("");
  const Toast = useToast();
  const dispatch = useDispatch();
  const schoolName = useSelector((state: any) => state.user.school);
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editableUsername, setEditableUsername] = useState("");
  const [userLikedPosts, setUserLikedPosts] = useState<any[] | null>(null);
  const [userPosts, setUserPosts] = useState<any[] | null>(null);
  const [editableEmail, setEditableEmail] = useState("");
  const [passwordReAuth, setPasswordReAuth] = useState("");
  const [editClicked, setEditClicked] = useState<boolean>(false);
  const [editUserClicked, setEditUserClicked] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const [credentialsModal, setCredentialsModal] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState<any>();
  const [lastLikesKey, setLastLikesKey] = useState<any>();
  const [noPostsYet, setNoPostsYet] = useState<boolean>(false);
  const [disabledDeleteButton, setDisabledDeleteButton] = useState<boolean>(false);
  const [credentialsUserModal, setCredentialsUserModal] =
    useState<boolean>(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [busy, setBusy] = useState<boolean>(false);
  const history = useHistory();

  const titleStyle = {
    fontSize: "6.5vw",
  };

  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };

  const handleUserPageNavigation = (uid: string) => {
    if (commentModalPost) {
      if (commentModalPost.uid != uid) {
        history.push("home/about/" + uid);
      }
    }
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

  const handleEdit = () => {
    inputRef.current?.setFocus();
    setEditClicked(true);
  };

  const handleUserEdit = () => {
    inputRef.current?.setFocus();
    setEditUserClicked(true);
  };

  const handleChangeEmailString = (e: any) => {
    setEditableEmail(e.detail.value);
  };

  const handleChangeUsernameString = (e: any) => {
    setEditableUsername(e.detail.value);
  };

  const handleX = () => {
    setEditClicked(false);
  };

  const handleUserX = () => {
    setEditUserClicked(false);
  };

  const handleCheckmark = () => {
    if (editableEmail.trim() != email.trim()) {
      promptForCredentials();
    } else {
      Toast.error("No changes made");
    }
    setEditClicked(false);
  };

  const handleUserCheckmark = () => {
    if (editableUsername.trim() != username.trim()) {
      promptForUsernameCredentials();
    } else {
      Toast.error("No changes made");
    }
    setEditUserClicked(false);
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
      Toast.error(err.message.toString());
      setBusy(false);
    }
  }

  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
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
          if (userPosts) {
            let tempPosts: any[] = [...userPosts];
            tempPosts[commentModalPostIndex].commentAmount += 1;
            setUserPosts(tempPosts);
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

  const deletePost = async (index : number) => {
    setDisabledDeleteButton(true);
    if(userPosts && userPosts.length > 0 && schoolName) {
      const postBeingDeleted = userPosts[index];
      const didDelete = promiseTimeout(10000, removePost(postBeingDeleted.key, schoolName));
      didDelete.then((res) => {
        if(res) {
          Toast.success("Post deleted");
          let tempPosts : any[] = [];
          for(let i = 0; i < userPosts.length; ++i) {
            if(i !== index) {
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
  }

  const deleteComment = async (index: number) => {
    setCommentsLoading(true);
    if (comments && commentModalPost && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(
        10000,
        removeComment(commentBeingDeleted, schoolName, commentModalPost.key)
      );
      didDelete.then((res) => {
        if (res) {
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

  const handleCommentModal = async (post: any, postIndex: number) => {
    setCommentsLoading(true);
    setCommentModalPostIndex(postIndex);
    setCommentModalPostDownvotes(post.downVotes);
    setCommentModalPostUpvotes(post.upVotes);
    setCommentModalPost(post);
    setShowCommentModal(true);
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
  const handleUpVote = async (postKey: string, index: number) => {
    const val = await upVote(schoolName, postKey);
    if (val && (val === 1 || val === -1)) {
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
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
        setUserPosts(tempPosts);
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
      if (userPosts && user) {
        let tempPosts: any[] = [...userPosts];
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
        setUserPosts(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
  };

  function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
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
    if(lastLikesKey && user) {
      getUserLikedPostsNextBatch(schoolName, user.uid, lastLikesKey).then((res : any) => {
        setLastLikesKey(res.lastKey);
        setUserLikedPosts(userLikedPosts?.concat(res.userLikes)!);
      })
      .catch((err : any) => {
        Toast.error(err.message.toString());
      })
    }
  }

  async function loadLogout() {
    let promise = promiseTimeout(10000, logout());
    promise.then((loggedOut: any) => {
      if (loggedOut == "true") {
        Toast.success("Logging out...");
      } else {
        Toast.error("Unable to logout");
      }
    });
    promise.catch((err: any) => {
      Toast.error(err);
    });
  }

  const loadUserLikes = () => {
    if(userLikedPosts == null && schoolName && user) {
      const hasLoaded = promiseTimeout(
        5000,
        getUserLikedPosts(schoolName, user.uid)
      );
      hasLoaded.then((res) => {
        if(res.userLikes.length > 0) {
          setUserLikedPosts(res.userLikes);
          setLastLikesKey(res.lastKey);
        }
      });
      hasLoaded.catch((err) => {
        Toast.error(err);
      })
    }
  };

  const loadUserPosts = () => {
    if (userPosts == null && schoolName && user) {
      // initial load
      const hasLoaded = promiseTimeout(
        5000,
        getUserPosts(schoolName, user.uid)
      );
      hasLoaded.then((res) => {
        if (res.userPosts.length > 0) {
          //console.log(res.userPosts);
          setUserPosts(res.userPosts);
          setLastKey(res.lastKey);
        } else {
          setNoPostsYet(true);
        }
      });
      hasLoaded.catch((err) => {
        Toast.error(err);
      });
    }
  };

  useEffect(() => {
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (!loading && user) {
        setProfilePhoto(user.photoURL!);
        setEmail(user.email!);
        setEditableEmail(user.email!);
        setUsername(user.displayName!);
        setEditableUsername(user.displayName!);
        setBusy(false);
      }
      return () => {};
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
    <React.Fragment>
      <IonContent>
        <IonHeader class="ion-no-border" style={ionHeaderStyle}>
          <IonToolbar>
            <IonAvatar className="user-avatar">
              <IonImg className="user-image" src={profilePhoto}></IonImg>
            </IonAvatar>
          </IonToolbar>
          <FadeIn>
            <IonToolbar mode="ios">
              <IonTitle size="small" style={titleStyle}>
                {" "}
                Hello
                <IonText color="primary">&nbsp;{editableUsername}</IonText>
              </IonTitle>
            </IonToolbar>
          </FadeIn>
        </IonHeader>
        <IonLoading
          message="Please wait..."
          duration={0}
          isOpen={busy}
        ></IonLoading>

        <IonModal backdropDismiss={false} isOpen={showCommentModal}>
          <IonContent>
            <div className="ion-modal">
              <IonToolbar mode="ios">
                <IonButtons slot="start">
                  <IonButton
                    onClick={() => {
                      setShowCommentModal(false);
                      setComment("");
                    }}
                  >
                    <IonIcon icon={arrowBack}></IonIcon> Back
                  </IonButton>
                </IonButtons>
              </IonToolbar>
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
                          </IonFab>
                        ) : null}
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
                        disabled={disabledLikeButtons === commentModalPostIndex}
                        mode="ios"
                        fill="outline"
                        color={
                          userPosts &&
                          user &&
                          userPosts[commentModalPostIndex].dislikes[
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
              ) : null}
              <p style={{ textAlign: "center" }}>Comments</p>
              <br></br>
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
                          {/*dont do this, change index!*/}
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
                            <IonButton mode="ios" fill="outline" color="medium">
                              <KeyboardArrowUpIcon />
                              <p>{comment.upVotes} </p>
                            </IonButton>
                            <IonButton mode="ios" fill="outline" color="medium">
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
              <wbr></wbr>
              <br></br>
            </div>
          </IonContent>
        </IonModal>

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
                loadUserLikes();
                break;
              default:
                break;
            }
          }}
        >
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
                Settings
              </IonHeader>
              <IonList mode="ios" inset={true}>
                <IonItem mode="ios">
                  <IonLabel mode="ios">
                    <IonText color="medium">
                      <p> Email </p>
                    </IonText>
                    <IonInput
                      ref={inputRef}
                      readonly={!editClicked}
                      value={editableEmail}
                      onIonChange={(e) => {
                        handleChangeEmailString(e);
                      }}
                    ></IonInput>
                  </IonLabel>
                  {editClicked ? (
                    <div>
                      <IonButton color="danger" slot="end" onClick={handleX}>
                        {" "}
                        X{" "}
                      </IonButton>
                      <IonButton
                        color="success"
                        slot="end"
                        onClick={handleCheckmark}
                      >
                        {" "}
                        &#10003;{" "}
                      </IonButton>
                    </div>
                  ) : (
                    <IonButton
                      disabled={editClicked}
                      onClick={handleEdit}
                      color="medium"
                      slot="end"
                    >
                      {" "}
                      Edit{" "}
                    </IonButton>
                  )}
                </IonItem>
                <IonItem mode="ios">
                  <IonLabel mode="ios">
                    <IonText color="medium">
                      <p> Username </p>
                    </IonText>
                    <IonInput
                      maxlength={15}
                      ref={inputRef}
                      readonly={!editUserClicked}
                      value={editableUsername}
                      onIonChange={(e) => {
                        handleChangeUsernameString(e);
                      }}
                    ></IonInput>
                  </IonLabel>
                  {editUserClicked ? (
                    <div>
                      <IonButton
                        color="danger"
                        slot="end"
                        onClick={handleUserX}
                      >
                        {" "}
                        X{" "}
                      </IonButton>
                      <IonButton
                        color="success"
                        slot="end"
                        onClick={handleUserCheckmark}
                      >
                        {" "}
                        &#10003;{" "}
                      </IonButton>
                    </div>
                  ) : (
                    <IonButton
                      disabled={editUserClicked}
                      onClick={handleUserEdit}
                      color="medium"
                      slot="end"
                    >
                      {" "}
                      Edit{" "}
                    </IonButton>
                  )}
                </IonItem>
                <IonItem mode="ios">
                  <p>Profile Picture</p>
                  <IonButton
                    onClick={handleProfilePictureEdit}
                    color="medium"
                    slot="end"
                  >
                    {" "}
                    Edit{" "}
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
              <div className="ion-button-container">
                <IonButton
                  onClick={loadLogout}
                  color="danger"
                  mode="ios"
                  shape="round"
                  fill="outline"
                  id="logout"
                >
                  Logout
                </IonButton>
                <IonButton
                  disabled={true}
                  color="danger"
                  mode="ios"
                  shape="round"
                  fill="outline"
                  id="deleteAccount"
                >
                  Delete Account
                </IonButton>
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
                                      userPosts[index].likes[user.uid] !==
                                        undefined
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
                                      handleDownVote(post.key, index);
                                    }}
                                  >
                                    <KeyboardArrowDownIcon />
                                    <p>{post.downVotes} </p>
                                  </IonButton>
                                  <IonFab horizontal="end">
                                    <IonButton
                                      disabled={disabledDeleteButton}
                                      mode="ios"
                                      fill="outline"
                                      color="danger"
                                      onClick={() => {
                                        deletePost(index);
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
                  Liked Posts
                </IonHeader>
                <IonCard>
                  <IonCardContent>
                    <IonCardTitle style={{fontSize : "0.75em"}}>
                      WORK IN PROGRESS :)
                    </IonCardTitle>
                  </IonCardContent>
                </IonCard>
              </div>
            </IonCard>
          </SwiperSlide>
        </Swiper>
      </IonContent>
    </React.Fragment>
  );
}

export default React.memo(User);
