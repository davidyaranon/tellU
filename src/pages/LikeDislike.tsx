import { IonButton, IonFab, IonIcon, IonItem } from "@ionic/react";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ForumIcon from "@mui/icons-material/Forum";
import { useHistory } from "react-router";
import { warningSharp } from "ionicons/icons";
import { Dialog } from "@capacitor/dialog";


export const LikeDislike = (props: any) => {

  const [disabledLikeButtons, setDisabledLikeButtons] = useState<number>(-1);
  const [likeAnimation, setLikeAnimation] = useState<number>(-1);
  const [dislikeAnimation, setDislikeAnimation] = useState<number>(-1);
  const history = useHistory();

  const post = props.post;
  const posts = props.posts;
  const handleUpVote = props.handleUpVote;
  const handleDownVote = props.handleDownVote;
  const index = props.index;
  const user = props.user;
  const schoolName = props.schoolName;
  const schoolColorToggled = props.schoolColorToggled;

  return (
    <IonItem lines="none" mode="ios">
      <IonButton
        onAnimationEnd={() => {
          setLikeAnimation(-1);
        }}
        className={
          likeAnimation === post.key ? "likeAnimation" : ""
        }
        disabled={disabledLikeButtons === index || Object.keys(post.likes).length - 1 === -1}
        mode="ios"
        fill="outline"
        color={
          user &&
            post.likes[user.uid] !== undefined && schoolName !== "Cal Poly Humboldt"
            ? "primary"
            : user && post.likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && schoolColorToggled
              ? "tertiary"
              : user && post.likes[user.uid] !== undefined && schoolName === "Cal Poly Humboldt" && !schoolColorToggled
                ? "primary"
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
        <p>{Object.keys(post.likes).length - 1} </p>
      </IonButton>
      <p>&nbsp;</p>
      <IonButton
        mode="ios"
        color="medium"
        onClick={() => {
          history.push("/post/" + post.key);
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
          dislikeAnimation === post.key ? "likeAnimation" : ""
        }
        disabled={disabledLikeButtons === index || Object.keys(post.dislikes).length - 1 === -1}
        mode="ios"
        fill="outline"
        color={
          index != -1 &&
            posts &&
            posts[index] &&
            "dislikes" in posts[index] &&
            user &&
            posts[index].dislikes[user.uid] !== undefined
            ? "danger"
            : "medium"
        }
        onClick={() => {
          setDislikeAnimation(post.key);
          setDisabledLikeButtons(index);
          handleDownVote(post.key, index, post);
          setDisabledLikeButtons(-1);
        }}
      >
        <KeyboardArrowDownIcon />
        <p>{Object.keys(post.dislikes).length - 1} </p>
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
}