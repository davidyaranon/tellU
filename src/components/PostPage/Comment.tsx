import { useToast } from "@agney/ir-toast";
import { Dialog } from "@capacitor/dialog";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { IonList, IonItem, IonLabel, IonAvatar, IonText, IonFab, IonNote, IonButton, IonRow } from "@ionic/react";
import Linkify from "linkify-react";
import { useState } from "react";
import { useHistory } from "react-router";
import { downVoteComment, promiseTimeout, removeCommentNew, upVoteComment } from "../../fbConfig";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import { timeout } from "../../helpers/timeout";
import ProfilePhoto from "../Shared/ProfilePhoto";
import { getDate } from "../../helpers/timeago";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useContext } from "../../my-context";
import FadeIn from "react-fade-in/lib/FadeIn";

export const PostComment = (props: any) => {

  const comment = props.comment;
  const comments = props.comments;
  const schoolName = props.schoolName;
  const index = props.index;
  const deleted = props.deleted;
  const postKey = props.postKey;
  const post = props.post;
  const user = props.user;
  const setComment = props.handleSetComment;
  const setComments = props.handleSetComments;
  const setCommentsLoading = props.handleSetCommentsLoading;

  const [disabledLikeButtonsComments, setDisabledLikeButtonsComments] = useState<number>(-1);
  const [likeAnimationComments, setLikeAnimationComments] = useState<number>(-1);
  const [dislikeAnimationComments, setDislikeAnimationComments] = useState<number>(-1);

  const history = useHistory();
  const Toast = useToast();
  const context = useContext();

  /**
   * @description deletes a comment from Firestore
   * First asks through a dialog if the user is sure they want to delete the comment,
   * then deleted the comment and possible image associated with it.
   * Finally, it shows a Toast confirming the comment has been deleted
   * 
   * @param {number} index the index of the comment in the comments array to be deleted
   * @param {string} commentUrl the url of the image attached to the comment (if any)
   * @returns 
   */
  const deleteComment = async (index: number, commentUrl: string) => {
    const { value } = await Dialog.confirm({
      title: 'Delete Comment',
      message: `Are you sure you'd like to delete your comment?`,
      okButtonTitle: 'Delete'
    });
    if (!value) { return; }
    if (comments && schoolName) {
      const commentBeingDeleted = comments[index];
      const didDelete = promiseTimeout(5000, removeCommentNew(commentBeingDeleted, schoolName, postKey, commentUrl));
      didDelete.then((res) => {
        if (res) {
          const toast = Toast.create({ message: 'Comment deleted', duration: 2000, color: 'toast-success' });
          toast.present();
          toast.dismiss();
          if (comments.length == 0) {
            setComments([]);
            // setListOfUsers([]);
            // setListOfUsersMap(new Map<string, string[]>());
          } else {
            let tempComments: any[] = [];
            for (let i = 0; i < comments.length; ++i) {
              if (i !== index) {
                tempComments.push(comments[i]);
              }
            }
            const tempUsernameList: string[] = [];
            for (let i = 0; i < tempComments.length; ++i) {
              tempUsernameList.push(tempComments[i].userName);
            }
            setComments(tempComments);
            console.log(tempComments);
          }
          setCommentsLoading(false);
        } else {
          const toast = Toast.create({ message: 'Unable to delete comment', duration: 2000, color: 'toast-error' });
          toast.present();
          setCommentsLoading(false);
        }
      });
      didDelete.catch((err) => {
        const toast = Toast.create({ message: err || "Something went wrong", duration: 2000, color: 'toast-error' });
        toast.present();
        setCommentsLoading(false);
      })
    } else {
      const toast = Toast.create({ message: 'Unable to delete comment', duration: 2000, color: 'toast-error' });
      toast.present();
      setCommentsLoading(false);
    }
  };

  /**
   * @description naviagtes to a user's About page
   * 
   * @param {string} uid the user id of the user who's profile is being viewed
   */
  const handleUserPageNavigation = (uid: string) => {
    history.push("/about/" + schoolName + "/" + uid);
  };

  /**
   * @description handles upvote logic of a comment
   * sends haptic feedback, updates the comment's likes/dislikes in RTDB
   * 
   * @param {string} commentKey the key of the comment being upvoted
   * @param {number} index the index of the comment from the comments array being upvoted
   */
  const handleUpVoteComment = async (commentKey: string, index: number) => {
    const val = await upVoteComment(commentKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (post && user) {
        let tempComments: any[] = [...comments];
        if (tempComments[index].likes[user.uid]) {
          delete tempComments[index].likes[user.uid];
        } else {
          if (tempComments[index].dislikes[user.uid]) {
            delete tempComments[index].dislikes[user.uid];
          }
          tempComments[index].likes[user.uid] = true;
        }
        setComments(tempComments);
        await timeout(100).then(() => {
          setDisabledLikeButtonsComments(-1);
        });
      }
    } else {
      const toast = Toast.create({ message: 'Unable to like comment', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  };

  /**
   * @description handles downvote logic of a comment
   * sends haptic feedback, updates the comment's likes/dislikes in RTDB
   * 
   * @param {string} commentKey the key of the comment being downvoted
   * @param {number} index the index of the comment from the comments array being downvoted
   */
  const handleDownVoteComment = async (commentKey: string, index: number) => {
    const val = await downVoteComment(commentKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (post && user) {
        let tempComments: any[] = [...comments];
        tempComments[index].downVotes += val;
        if (tempComments[index].dislikes[user.uid]) {
          delete tempComments[index].dislikes[user.uid];
        } else {
          if (tempComments[index].likes[user.uid]) {
            delete tempComments[index].likes[user.uid];
          }
          tempComments[index].dislikes[user.uid] = true;
        }
        setComments(tempComments);
        await timeout(100).then(() => {
          setDisabledLikeButtonsComments(-1);
        });
      }
    } else {
      const toast = Toast.create({ message: 'Unable to dislike comment', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  };

  return (
    <FadeIn>
      <IonList inset={true} key={index}>
        {" "}
        <IonItem mode="ios" lines="none">
          <IonLabel class="ion-text-wrap">
            <IonRow>
              <IonAvatar class="posts-avatar" onClick={() => {
                setComment("");
                handleUserPageNavigation(comment.uid);
              }}
              >
                <ProfilePhoto uid={comment.uid}></ProfilePhoto>
              </IonAvatar>
              <p style={{ color: "var(--ion-color-light)", padding: "10px", fontWeight: 'bold' }}> {comment.userName} </p>
            </IonRow>
            <Linkify tagName="h3" className="h2-message-comment">
              {comment.comment}
            </Linkify>
            {"imgSrc" in comment && comment.imgSrc && comment.imgSrc.length > 0 ? (
              <>
                <br></br>
                <div
                  className="ion-img-container"
                  style={{ backgroundImage: `url(${comment.imgSrc})`, borderRadius: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const img: CapacitorImage = {
                      url: comment.imgSrc,
                      title: `${comment.userName}'s comment`
                    };
                    CapacitorPhotoViewer.show({
                      options: {
                        title: true
                      },
                      images: [img],
                      mode: 'one',
                    }).catch((err) => {
                      const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                      toast.present();
                    });
                  }}
                >
                </div>
              </>
            ) : null}
          </IonLabel>
          {"timestamp" in comment ? (
            <IonFab vertical="top" horizontal="end">
              <IonNote style={{ fontSize: "0.75em" }}>
                {getDate(comment.timestamp)}
              </IonNote>
            </IonFab>
          ) : null}
          <div></div>
        </IonItem>
        <IonItem lines="none" mode="ios">
          <IonButton
            onAnimationEnd={() => {
              setLikeAnimationComments(-1);
            }}
            className={
              likeAnimationComments === comment.key ? "likeAnimation" : ""
            }
            disabled={disabledLikeButtonsComments === index || deleted || (Object.keys(comment.likes).length - 1) === -1}
            mode="ios"
            fill="outline"
            color={
              comment &&
                user &&
                "likes" in comment &&
                comment.likes[user.uid] !==
                undefined &&
                schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ?
                "tertiary"
                : comment &&
                  user &&
                  "likes" in comment &&
                  comment.likes[user.uid] !==
                  undefined &&
                  schoolName === "Cal Poly Humboldt" && !context.schoolColorToggled ?
                  "toast-success"
                  : "medium"
            }
            onClick={() => {
              setLikeAnimationComments(comment.key);
              setDisabledLikeButtonsComments(index);
              handleUpVoteComment(comment.key, index);
            }}
          >
            <KeyboardArrowUpIcon />
            <p>{Object.keys(comment.likes).length - 1} </p>
          </IonButton>
          <IonButton
            mode="ios"
            fill="outline"
            disabled={
              disabledLikeButtonsComments === index || deleted || Object.keys(comment.dislikes).length - 1 === -1
            }
            onAnimationEnd={() => {
              setDislikeAnimationComments(-1);
            }}
            className={
              dislikeAnimationComments === comment.key ? "likeAnimation" : ""
            }
            color={
              comment &&
                user &&
                "dislikes" in comment &&
                comment.dislikes[user.uid] !==
                undefined
                ? "toast-error"
                : "medium"
            }
            onClick={() => {
              setDislikeAnimationComments(comment.key);
              setDisabledLikeButtonsComments(index);
              handleDownVoteComment(comment.key, index);
            }}
          >
            <KeyboardArrowDownIcon />
            <p>{Object.keys(comment.dislikes).length - 1} </p>
          </IonButton>
          {user && user.uid === comment.uid ? (
            <IonFab horizontal="end">
              <IonButton
                mode="ios"
                fill="outline"
                color="toast-error"
                onClick={() => { deleteComment(index, comment.url); }}
              >
                <DeleteIcon />
              </IonButton>
            </IonFab>
          ) : null}
        </IonItem>
      </IonList>
    </FadeIn>
  )
}