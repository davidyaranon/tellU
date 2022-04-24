import {
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonCardTitle,
  IonCard,
  IonSlides,
  IonSlide,
  IonInfiniteScrollContent,
  IonModal,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonLoading,
  IonText,
  IonAvatar,
  IonNote,
  IonInput,
  IonActionSheet,
  IonButton,
  IonIcon,
  IonRippleEffect,
  IonFab,
  IonFabButton,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSearchbar,
  IonBreadcrumbs,
  IonBreadcrumb,
  IonicSwiper,
  IonCardContent,
  IonRow,
  IonCol,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  chatbubblesOutline,
  chevronBack,
  chevronForward,
} from "ionicons/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, downVote, getTopPostsWithinPastDay, upVote } from "../fbconfig";
import Header, { ionHeaderStyle } from "./Header";
import "../App.css";
import { useHistory } from "react-router";
import { getUserData, getNextBatchUsers } from "../fbconfig";
import { ToastProvider, useToast } from "@agney/ir-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper";
import { useSelector } from "react-redux";
import "swiper/css";
import FadeIn from "react-fade-in";
import { PhotoViewer } from "@awesome-cordova-plugins/photo-viewer";
// import 'swiper/css/effect-cards';

function Community() {
  const schoolName = useSelector((state: any) => state.user.school);
  const Toast = useToast();
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [commentModalPost, setCommentModalPost] = useState<any | null>(null);
  const [lastKey, setLastKey] = useState<string>("");
  const [userList, setUserList] = useState<any[]>([]);
  const [commentModalPostUpvotes, setCommentModalPostUpvotes] =
    useState<number>(-1);
  const [commentModalPostDownvotes, setCommentModalPostDownvotes] =
    useState<number>(-1);
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const history = useHistory();
  const topPostsCache = localStorage.getItem("topPosts") || "false";
  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  };
  function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }
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
  const handleUpVote = async (postKey: string, index: number) => {
    const val = await upVote(schoolName, postKey);
    if (val && (val === 1 || val === -1)) {
      if (topPosts && user) {
        let tempPosts: any[] = [...topPosts];
        tempPosts[index].data.upVotes += val;
        setCommentModalPostUpvotes(commentModalPostUpvotes + val);
        if (tempPosts[index].data.likes[user.uid]) {
          delete tempPosts[index].data.likes[user.uid];
        } else {
          if (tempPosts[index].data.dislikes[user.uid]) {
            delete tempPosts[index].data.dislikes[user.uid];
            tempPosts[index].data.downVotes -= 1;
            setCommentModalPostDownvotes(commentModalPostDownvotes - 1);
          }
          tempPosts[index].data.likes[user.uid] = true;
        }
        setTopPosts(tempPosts);
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
      if (topPosts && user) {
        let tempPosts: any[] = [...topPosts];
        setCommentModalPostDownvotes(commentModalPostDownvotes + val);
        tempPosts[index].data.downVotes += val;
        if (tempPosts[index].data.dislikes[user.uid]) {
          delete tempPosts[index].data.dislikes[user.uid];
        } else {
          if (tempPosts[index].data.likes[user.uid]) {
            delete tempPosts[index].data.likes[user.uid];
            tempPosts[index].data.upVotes -= 1;
            setCommentModalPostUpvotes(commentModalPostUpvotes - 1);
          }
          tempPosts[index].data.dislikes[user.uid] = true;
        }
        setTopPosts(tempPosts);
        await timeout(1000).then(() => {
          setDisabledLikeButtons(-1);
        });
      }
    } else {
      Toast.error("Unable to dislike post :(");
    }
  };
  const handleUserPageNavigation = (uid: string) => {
    history.push("users/" + uid, { from: "home" });
  };
  const fetchMoreUserData = (key: string) => {
    if (key && key.length > 0) {
      setBusy(true);
      getNextBatchUsers(key)
        .then((res) => {
          setLastKey(res!.lastKey);
          setUserList(userList?.concat(res?.userList));
          setBusy(false);
        })
        .catch((err: any) => {
          Toast.error(err.message.toString());
          setBusy(false);
        });
    }
  };
  const handleCardClick = (post: any) => {
    console.log(post);
    setCommentModalPost(post);
    setShowModalComment(true);
  };
  const handleChangeComment = (e: any) => {
    let currComment = e.detail.value;
    setComment(currComment);
  };
  useEffect(() => {
    setBusy(true);
    if (!user) {
      history.replace("/landing-page");
    } else {
      if (schoolName) {
        if (topPostsCache != "false") {
          setTopPosts(JSON.parse(topPostsCache));
        }
        getTopPostsWithinPastDay(schoolName).then((res: any) => {
          setTopPosts(res);
          localStorage.setItem("topPosts", JSON.stringify(res));
          console.log(res);
        });
      }
      setBusy(false);
    }
  }, [user, schoolName]);
  return (
    <React.Fragment>
      <IonContent>
        <IonHeader class="ion-no-border" style={ionHeaderStyle}>
          <IonToolbar style={{ marginTop: "5%" }} mode="ios">
            <IonTitle>Top Posts</IonTitle>
            <FadeIn transitionDuration={750}>
              <IonFab horizontal="end">
                <IonIcon icon={chevronForward} />
              </IonFab>
              <IonFab horizontal="start">
                <IonIcon icon={chevronBack} />
              </IonFab>
            </FadeIn>
          </IonToolbar>
        </IonHeader>
        <IonLoading
          message="Please wait..."
          duration={0}
          isOpen={busy}
        ></IonLoading>

        <IonModal backdropDismiss={false} isOpen={showModalComment}>
          <IonContent>
            <div className="ion-modal">
              <IonFab horizontal="end">
                <IonButton
                  onClick={() => {
                    setShowModalComment(false);
                    setComment("");
                  }}
                  color="danger"
                  mode="ios"
                  shape="round"
                  fill="outline"
                  id="close"
                >
                  X
                </IonButton>
              </IonFab>
              <br></br>
              <br></br>
              <br></br>
              {commentModalPost && commentModalPost.data ? (
                <div>
                  <IonList inset={true}>
                    <IonItem lines="none">
                      <IonLabel class="ion-text-wrap">
                        <IonText color="medium">
                          <p>
                            <IonAvatar onClick={() => {
                              //setComments([]);
                              setShowModalComment(false);
                              setComment("");
                              handleUserPageNavigation(
                                commentModalPost.data.uid
                              );
                            }} class="posts-avatar">
                              <IonImg
                                src={commentModalPost.data.photoURL}
                              ></IonImg>
                            </IonAvatar>
                            {commentModalPost.data.userName}
                          </p>
                        </IonText>
                        {commentModalPost.data.postType &&
                        commentModalPost.data.postType != "general" ? (
                          <IonFab vertical="top" horizontal="end">
                            <p
                              style={{
                                fontWeight: "bold",
                                color: getColor(commentModalPost.data.postType),
                              }}
                            >
                              {commentModalPost.data.postType.toUpperCase()}
                            </p>
                          </IonFab>
                        ) : null}
                        <wbr></wbr>
                        <h2 className="h2-message">
                          {commentModalPost.data.message}
                        </h2>
                      </IonLabel>
                      <div id={commentModalPost.data.postType}></div>
                    </IonItem>
                  </IonList>
                  <div className="verticalLine"></div>
                  {commentModalPost.data.imgSrc &&
                  commentModalPost.data.imgSrc.length > 0 ? (
                    <IonCard style={{ bottom: "7.5vh" }}>
                      <IonCardContent>
                        <IonImg
                          onClick={() => {
                            PhotoViewer.show(commentModalPost.data.imgSrc);
                          }}
                          src={commentModalPost.data.imgSrc}
                        ></IonImg>
                      </IonCardContent>
                    </IonCard>
                  ) : null}
                </div>
              ) : null}
              <p style={{ textAlign: "center",}}>Comments</p>
              <br></br>
              {/* {commentModalPost.comments && commentModalPost.comments.length > 0
                ? commentModalPost.comments?.map((comment : any, index : number) => (
                    <IonList inset={true} key={index}>
                      <IonItem lines="none">
                        <IonLabel class="ion-text-wrap">
                          <IonText color="medium">
                            <p>
                              <IonAvatar class="posts-avatar">
                                <IonImg src={comment?.photoURL!}></IonImg>
                              </IonAvatar>
                              {comment.userName}
                            </p>
                          </IonText>
                          <wbr></wbr>
                          <h2 className="h2-message"> {comment.comment} </h2>
                          {comment.url && comment.url.length > 0 ? (
                            <div className="ion-img-container">
                              <br></br>
                              <IonImg
                                onClick={() => {
                                  PhotoViewer.show(comment.imgSrc);
                                }}
                                src={comment.imgSrc}
                              />
                            </div>
                          ) : null}
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
                      </IonItem>
                    </IonList>
                  ))
                : null} */}
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
                >
                  Comment
                </IonButton>
              </div>
              <wbr></wbr>
              <br></br>
            </div>
          </IonContent>
        </IonModal>

        <Swiper slidesPerView={1.5}>
          {topPosts && topPosts.length > 0
            ? topPosts.map((post, index) => {
                return (
                  <SwiperSlide key={post.key}>
                    <IonCard className="ion-card-community" mode="ios">
                      <IonCardContent
                        style={{ minHeight: "60vh" }}
                        onClick={() => {
                          handleCardClick(post);
                        }}
                      >
                        {post.data.postType &&
                        post.data.postType != "general" ? (
                          <IonFab horizontal="end" vertical="top">
                            <p
                              style={{
                                fontWeight: "bold",
                                fontSize: "2.5vw",
                                color: getColor(post.data.postType),
                              }}
                            >
                              {post.data.postType.toUpperCase()}
                            </p>
                          </IonFab>
                        ) : null}
                        <IonCardTitle style={{ fontSize: "medium" }} mode="ios">
                          {post.data.userName}
                        </IonCardTitle>
                        <br></br>
                        <IonNote color="medium" className="subtitle">
                          {post.data.message.length > 150
                            ? post.data.message.substring(0, 150) + "..."
                            : post.data.message}
                        </IonNote>
                        {post.data.imgSrc && post.data.imgSrc.length > 0 ? (
                          <div>
                            <br></br>
                            <IonImg
                              className="ion-img-container"
                              src={post.data.imgSrc}
                            />
                            <br></br>
                            <br></br>
                            <br></br>
                          </div>
                        ) : null}
                      </IonCardContent>
                      <IonFab vertical="bottom">
                        <IonRow>
                          <IonCol size="4">
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
                              onClick={() => {
                                setLikeAnimation(post.key);
                                setDisabledLikeButtons(index);
                                handleUpVote(post.key, index);
                              }}
                              style={{ width: "16vw" }}
                              mode="ios"
                              fill="outline"
                              color={
                                topPosts &&
                                user &&
                                topPosts[index].data.likes[user.uid] !==
                                  undefined
                                  ? "primary"
                                  : "medium"
                              }
                            >
                              <KeyboardArrowUpIcon />
                              <p>{post.data.upVotes} </p>
                            </IonButton>
                          </IonCol>
                          <IonCol size="4">
                            <IonButton
                              onClick={() => {
                                handleCardClick(post);
                              }}
                              style={{ width: "16vw" }}
                              mode="ios"
                              color="medium"
                            >
                              <IonIcon icon={chatbubblesOutline} />
                              <p>&nbsp; {post.data.commentAmount} </p>
                            </IonButton>
                          </IonCol>
                          <IonCol size="4">
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
                              style={{ width: "16vw" }}
                              mode="ios"
                              fill="outline"
                              onClick={() => {
                                setDislikeAnimation(post.key);
                                setDisabledLikeButtons(index);
                                handleDownVote(post.key, index);
                              }}
                              color={
                                topPosts &&
                                user &&
                                topPosts[index].data.dislikes[user.uid] !==
                                  undefined
                                  ? "danger"
                                  : "medium"
                              }
                            >
                              <KeyboardArrowDownIcon />
                              <p>{post.data.downVotes} </p>
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      </IonFab>
                    </IonCard>
                  </SwiperSlide>
                );
              })
            : null}
        </Swiper>
      </IonContent>
    </React.Fragment>
  );
}

export default React.memo(Community);
