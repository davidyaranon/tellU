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
import { auth, getTopPostsWithinPastDay } from "../fbconfig";
import Header, { ionHeaderStyle } from "./Header";
import "../App.css";
import { useHistory } from "react-router";
import { getUsers, getNextBatchUsers } from "../fbconfig";
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
  const history = useHistory();
  const topPostsCache = localStorage.getItem("topPosts") || "false";
  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
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
        if(topPostsCache != "false") {
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
                            <IonAvatar class="posts-avatar">
                              <IonImg src={commentModalPost.data.photoURL}></IonImg>
                            </IonAvatar>
                            {commentModalPost.data.userName}
                          </p>
                        </IonText>
                        {/* {commentModalPostType != "general"  ? (
                    <IonFab vertical='top' horizontal='end'>
                      <p style={{fontWeight:"bold", color:getColor(commentModalPostType)}}>{commentModalPostType.toUpperCase()}</p>
                    </IonFab>
                    ) : (null) } */}
                        <wbr></wbr>
                        <h2 className="h2-message">{commentModalPost.data.message}</h2>
                      </IonLabel>
                      <div id={commentModalPost.data.postType}></div>
                    </IonItem>
                  </IonList>
                  <div className="verticalLine"></div>
                  {commentModalPost.imgSrc && commentModalPost.imgSrc.length > 0 ? (
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
            ? topPosts.map((post) => {
                return (
                  <SwiperSlide key={post.key}>
                    <IonCard
                      onClick={() => {
                        handleCardClick(post);
                      }}
                      className="ion-card-community"
                      mode="ios"
                    >
                      <IonCardContent>
                        {post.data.postType &&
                        post.data.postType != "general" ? (
                          <IonFab horizontal="end">
                            <p
                              style={{
                                fontWeight: "bold",
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
                          {post.data.message}
                        </IonNote>
                        {post.imgSrc && post.imgSrc.length > 0 ? (
                          <div>
                            <br></br>
                            <IonImg
                              className="ion-img-style"
                              src={post.imgSrc}
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
                              style={{ width: "16vw" }}
                              mode="ios"
                              fill="outline"
                              color="medium"
                            >
                              <KeyboardArrowUpIcon />
                              <p>{post.data.upVotes} </p>
                            </IonButton>
                          </IonCol>
                          <IonCol size="4">
                            <IonButton
                              style={{ width: "16vw" }}
                              mode="ios"
                              color="medium"
                            >
                              <IonIcon icon={chatbubblesOutline} />
                              <p>&nbsp; {post.data.comments.length} </p>
                            </IonButton>
                          </IonCol>
                          <IonCol size="4">
                            <IonButton
                              style={{ width: "16vw" }}
                              mode="ios"
                              fill="outline"
                              color="medium"
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
