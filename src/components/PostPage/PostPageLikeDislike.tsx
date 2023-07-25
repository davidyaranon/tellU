import { IonButton, IonFab, IonIcon, IonItem } from "@ionic/react";
import { memo, useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useHistory } from "react-router";
import { chatboxOutline, warningSharp } from "ionicons/icons";
import { Dialog } from "@capacitor/dialog";
import { useToast } from "@agney/ir-toast";
import { downVote, removePost, upVote } from "../../fbConfig";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { timeout } from "../../helpers/timeout";
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext } from "../../my-context";

/**
 * Handles upvoting and downvoting of posts on Home page
 */
export const PostPageLikeDislike = memo((props: any) => {

  // hooks
  const history = useHistory();
  const context = useContext();

  // state variables
  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const [likes, setLikes] = useState<any>(props.likes);
  const [dislikes, setDisLikes] = useState<any>(props.dislikes);

  const post = props.post;
  const setDeletingComment = props.handleSetDeletingComment;
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
        color={user && likes[user.uid] !== undefined && context.darkMode ? "toast-success" : user && likes[user.uid] !== undefined && !context.darkMode ? "toast-success-light" : "medium"}
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
        <IonButton mode="ios" color="medium" fill='outline' onClick={() => { history.push("/post/" + schoolName + "/" + post.userName + "/" + post.key); }}>
          <IonIcon icon={chatboxOutline} />
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
      {user && user.uid === post.uid && "reports" in post && post.reports > 1 ? (
        <IonFab horizontal="end">
          <IonButton
            mode="ios"
            fill="outline"
            color="toast-error"
            onClick={() => { }}
          >
            <DeleteIcon />
          </IonButton>
          {" "}
          <IonButton mode="ios" fill="clear" onClick={() => {
            Dialog.alert({
              title: "Flagged Post",
              message: 'Post has been reported as sensitive/objectionable'
            })
          }}>
            <IonIcon icon={warningSharp} color="warning" style={{ padding: "-10vh" }}></IonIcon>
          </IonButton>
        </IonFab>
      ) : user && user.uid === post.uid && "reports" in post && post.reports < 2 ?
        (
          <IonFab horizontal="end">
            <IonButton
              mode="ios"
              fill="outline"
              color="toast-error"
              onClick={async () => {
                const { value } = await Dialog.confirm({
                  title: 'Delete Post',
                  message: `Are you sure you'd like to delete your post?`,
                  okButtonTitle: 'Delete'
                });
                if (!value) { return; }
                if ("url" in post && post.url && post.url.length > 0) {
                  console.log("deleting post with images");
                  if (!schoolName) {
                    const toast = Toast.create({ message: 'Something went wrong when retreiving school', duration: 2000, color: 'toast-error' });
                    toast.present();
                  }
                  setDeletingComment(true);
                  const didDelete = await removePost(postKeyMatch, schoolName, post.url);
                  if (didDelete !== undefined) {
                    const toast = Toast.create({ message: 'Post deleted', duration: 2000, color: context.darkMode ? 'toast-success' : 'toast-success-light' });
                    toast.present();
                    toast.dismiss();
                  } else {
                    const toast = Toast.create({ message: 'Something went wrong when deleting post, try again', duration: 2000, color: 'toast-error' });
                    toast.present();
                  }
                  history.push("/home");
                  setDeletingComment(false);
                } else {
                  console.log("deleting post without images");
                  if (!schoolName) {
                    const toast = Toast.create({ message: 'Something went wrong, try again', duration: 2000, color: 'toast-error' });
                    toast.present();
                  }
                  setDeletingComment(true);
                  const didDelete = await removePost(postKeyMatch, schoolName, []);
                  if (didDelete !== undefined) {
                    const toast = Toast.create({ message: 'Post deleted', duration: 2000, color: context.darkMode ? 'toast-success' : 'toast-success-light' });
                    toast.present();
                    toast.dismiss();
                  } else {
                    const toast = Toast.create({ message: 'Something went wrong when deleting post, try again', duration: 2000, color: 'toast-error' });
                    toast.present();
                  }
                  history.push("/home");
                  setDeletingComment(false);
                }
              }}
            >
              <DeleteIcon />
            </IonButton>
          </IonFab>
        ) : null}
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