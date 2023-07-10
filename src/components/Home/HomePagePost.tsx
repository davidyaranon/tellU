import { IonList, IonLabel, IonAvatar, IonItem, IonRow, IonButton, IonFab, IonIcon } from "@ionic/react";
import { useHistory } from "react-router";
import ProfilePhoto from "../Shared/ProfilePhoto";
import { PostType } from "../Shared/PostType";
import { PostMessage } from "./PostMessage";
import PostImages from "../Shared/PostImages";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import { useCallback, useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { useToast } from "@agney/ir-toast";

import '../../App.css';
import { Dialog } from "@capacitor/dialog";
import { warningSharp } from "ionicons/icons";

export const HomePagePost = (props: any) => {
  const post = props.post;
  const index = props.index;
  const user = props.user;
  const likes = props.likes || {};
  const dislikes = props.dislikes || {};
  const profileClickable = props.profileClickable;
  const handleDownVote = props.handleDownVote;
  const handleUpVote = props.handleUpVote;

  let schoolName = props.schoolName;

  // state variables
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // hooks
  const history = useHistory();
  const Toast = useToast();

  /**
   * Loads school from local storage (Preferences API)
   */
  const setSchool = useCallback(async () => {
    const school = await Preferences.get({ key: 'school' });
    if (school && school.value) {
      schoolName = school.value;
    } else {
      const toast = Toast.create({ message: 'Something went wrong when retreiving school', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  }, []);

  useEffect(() => {
    if (!schoolName || typeof schoolName !== 'string' || schoolName.length === 0) {
      setSchool();
    }
  }, [])

  return (
    <IonList key={index} inset mode="ios" >
      <IonItem lines="none" mode="ios" onClick={() => { history.push("/post/" + schoolName + "/" + post.userName + "/" + post.key); }}>
        <IonLabel>
          <IonRow>
            <IonAvatar class="posts-avatar" onClick={(e) => { e.stopPropagation(); if (profileClickable !== false) history.push("/about/" + schoolName + "/" + post.uid); }} >
              <ProfilePhoto uid={post.uid} />
            </IonAvatar>
            <p style={{ color: "var(--ion-color-light)", padding: "10px", fontWeight: 'bold' }}> {post.userName} </p>
          </IonRow>
          <PostType schoolName={schoolName} type={post.postType} marker={post.marker} POI={post.POI} timestamp={post.timestamp} />
          <PostMessage schoolName={schoolName} message={post.message} classNumber={post.classNumber} className={post.className} reports={post.reports || 0} />
          <PostImages userName={post.userName} imgSrc={post.imgSrc || []} reports={post.reports || 0} />
        </IonLabel>
      </IonItem>
      <IonItem lines="none" mode="ios" style={{ marginLeft: "1%" }}>
        <IonButton
          onAnimationEnd={() => { setLikeAnimation(-1); }}
          className={likeAnimation === post.key ? "likeAnimation" : ""}
          disabled={isLiking || disabledLikeButtons === index || Object.keys(likes).length - 1 === -1}
          mode="ios"
          fill="outline"
          color={
            user &&
              likes[user.uid] !== undefined
              ? "toast-success"
              : "medium"
          }
          onClick={() => {
            setLikeAnimation(post.key);
            setDisabledLikeButtons(index);
            setIsLiking(true);
            handleUpVote(post.key, index, post);
            setIsLiking(false);
            setDisabledLikeButtons(-1);
          }}
        >
          <KeyboardArrowUpIcon />
          <p>{Object.keys(likes).length - 1} </p>
        </IonButton>
        <p>&nbsp;</p>
        <IonButton mode="ios" color="medium" onClick={() => { history.push("/post/" + schoolName + "/" + post.userName + "/" + post.key); }}>
          <ForumIcon />
          <p>&nbsp; {post.commentAmount} </p>
        </IonButton>
        <IonButton
          onAnimationEnd={() => { setDislikeAnimation(-1); }}
          className={dislikeAnimation === post.key ? "likeAnimation" : ""}
          disabled={disabledLikeButtons === index || Object.keys(dislikes).length - 1 === -1}
          mode="ios"
          fill="outline"
          color={
            index != -1 &&
              user &&
              dislikes[user.uid] !== undefined
              ? "toast-error"
              : "medium"
          }
          onClick={() => {
            setDislikeAnimation(post.key);
            setDisabledLikeButtons(index);
            setIsLiking(true);
            handleDownVote(post.key, index);
            setIsLiking(false);
            setDisabledLikeButtons(-1);
          }}
        >
          <KeyboardArrowDownIcon />
          <p>{Object.keys(dislikes).length - 1} </p>
        </IonButton>
        {"reports" in post && post.reports > 1 &&
          <IonFab horizontal="end">
            <IonIcon icon={warningSharp} color="warning" onClick={() => {
              Dialog.alert({
                title: "Flagged Post",
                message: 'Post has been reported as sensitive/objectionable'
              })
            }}></IonIcon>
          </IonFab>
        }
      </IonItem>
    </IonList>
  )
}