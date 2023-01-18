import { IonButton, IonFab, IonIcon, IonItem, IonRippleEffect } from "@ionic/react";
import { memo, useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import { useHistory } from "react-router";
import { warningSharp } from "ionicons/icons";
import { Dialog } from "@capacitor/dialog";
import { useToast } from "@agney/ir-toast";
import { downVote, upVote } from "../../fbConfig";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { timeout } from "../../helpers/timeout";

/**
 * Handles upvoting and downvoting of posts on Home page
 */
export const LikeDislike = memo((props: any) => {

  // hooks
  const history = useHistory();

  // state variables
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [likes, setLikes] = useState<any>(props.likes);
  const [dislikes, setDisLikes] = useState<any>(props.dislikes);

  const post = props.post;
  const postKeyMatch = props.postKey;
  const Toast = useToast();
  const index = props.index;
  const user = props.user;
  const schoolName = props.schoolName;
  const schoolColorToggled = props.schoolColorToggled;

  useEffect(() => {
    if (props.likes) {
      setLikes(props.likes);
    }
  }, [props.likes])

  useEffect(() => {
    if (props.dislikes) {
      setDisLikes(props.dislikes);
    }
  }, [props.dislikes])

  /**
   * @description upvotes a post and updates the state
   * 
   * @param {string} postKey the Firestore key of the post
   * @param {number} index the index of the post in the posts array
   * @param {any} post the post object used for updating user's likes document
  */
  const handleUpVote = async (postKey: string, index: number, post: any) => {
    if (postKeyMatch && postKeyMatch.length > 0) {
      postKey = postKeyMatch;
    }
    const val = await upVote(postKey, post);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (user) {
        let likesCopy = { ...likes };
        let dislikesCopy = { ...dislikes };
        if (likesCopy[user.uid]) {
          delete likesCopy[user.uid];
        } else {
          if (dislikesCopy[user.uid]) {
            delete dislikesCopy[user.uid];
          }
          likesCopy[user.uid] = true;
        }
        setLikes(likesCopy);
        setDisLikes(dislikesCopy);
        await timeout(100);
      }
    } else {
      const toast = Toast.create({ message: 'Unable to like post', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  };

  /**
   * @description downvotes a post and updates the state
   * 
   * @param {string} postKey the Firestore key of the post
   * @param {number} index the index of the post in the posts array
   */
  const handleDownVote = async (postKey: string, index: number) => {
    if (postKeyMatch && postKeyMatch.length > 0) {
      postKey = postKeyMatch;
    }
    const val = await downVote(postKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (user) {
        let likesCopy = { ...likes };
        let dislikesCopy = { ...dislikes };
        if (dislikesCopy[user.uid]) {
          delete dislikesCopy[user.uid];
        } else {
          if (likesCopy[user.uid]) {
            delete likesCopy[user.uid];
          }
          dislikesCopy[user.uid] = true;
        }
        setLikes(likesCopy);
        setDisLikes(dislikesCopy);
        await timeout(100);
      }
    } else {
      const toast = Toast.create({ message: 'Unable to dislike post', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  };

  return (
    <IonItem lines="none" mode="ios">
      <IonButton
        onAnimationEnd={() => { setLikeAnimation(-1); }}
        className={likeAnimation === post.key ? "likeAnimation" : ""}
        disabled={disabledLikeButtons === index || Object.keys(likes).length - 1 === -1}
        mode="ios"
        fill="outline"
        color={
          user &&
            likes[user.uid] !== undefined && schoolName !== "Cal Poly Humboldt"
            ? "toast-success"
            : user && likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && schoolColorToggled
              ? "tertiary"
              : user && likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && !schoolColorToggled
                ? "toast-success"
                : "medium"
        }
        onClick={() => {
          setLikeAnimation(post.key);
          setDisabledLikeButtons(index);
          handleUpVote(post.key, index, post);
          setDisabledLikeButtons(-1);
        }}
      >
        <KeyboardArrowUpIcon />
        <p>{Object.keys(likes).length - 1} </p>
      </IonButton>
      <p>&nbsp;</p>
      {!postKeyMatch &&
        <IonButton mode="ios" color="medium" onClick={() => { history.push("/post/" + schoolName + "/" + post.userName + "/" + post.key); }}>
          <ForumIcon />
          <p>&nbsp; {post.commentAmount} </p>
        </IonButton>
      }
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
          handleDownVote(post.key, index);
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
  )
});