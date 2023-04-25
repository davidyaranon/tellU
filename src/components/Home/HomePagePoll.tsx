import React from "react";
import {
  IonCard, IonCardContent, IonAvatar, IonText,
  IonCardTitle, IonList, IonItem, IonFab
} from "@ionic/react";
import { useHistory } from "react-router";
import { getDate, getTimeLeft } from "../../helpers/timeago";
import ProfilePhoto from "../Shared/ProfilePhoto";
import { useToast } from "@agney/ir-toast";
import { useContext } from "../../my-context";
import { pollVote, promiseTimeout } from "../../fbConfig";
import FadeIn from "react-fade-in/lib/FadeIn";

export const HomePagePoll = (props: any) => {
  const postIndex = props.index;
  const post = props.post;
  const poll = props.post;
  const user = props.user;
  const schoolName = props.schoolName;
  const profileClickable = props.profileClickable;

  // hooks
  const history = useHistory();
  const context = useContext();
  const Toast = useToast();

  // state variables
  const [voteBeingCasted, setVoteBeingCasted] = React.useState<boolean>(false);

  /**
   * @description Casts a vote for a poll and updates poll data accordingly
   * 
   * @param {number} index the poll option index
   * @param {string} pollKey the id of the poll document in Firestore
   */
  const handlePollVote = async (index: number, pollKey: string) => {
    if (user && schoolName) {
      setVoteBeingCasted(true);
      const castedVote = promiseTimeout(5000, pollVote(schoolName, index, pollKey, user.uid));
      castedVote.then((res) => {
        if (res) {
          if (post) {
            let tempPost = post;
            if ("results" in tempPost &&
              "voteMap" in tempPost &&
              "votes" in tempPost) {
              tempPost["results"][index] += 1;
              tempPost["voteMap"][user.uid] = index;
              tempPost["votes"] += 1;
              props.updatePosts(tempPost, postIndex);
            } else {
              const toast = Toast.create({ message: 'Something went wrong when updating, reload the app', duration: 2000, color: 'toast-error' });
              toast.present();
            }
          } else {
            const toast = Toast.create({ message: 'Something went wrong when updating, reload the app', duration: 2000, color: 'toast-error' });
            toast.present();
          }
          const toast = Toast.create({ message: 'Vote cast!', duration: 2000, color: 'toast-success' });
          toast.present();
          toast.dismiss();
          setVoteBeingCasted(false);
        } else {
          const toast = Toast.create({ message: 'Something went wrong when casting vote', duration: 2000, color: 'toast-error' });
          toast.present();
        }
      });
      castedVote.catch((err) => {
        const toast = Toast.create({ message: 'Check your internet connection', duration: 2000, color: 'toast-error' });
        toast.present();
      });
    } else {
      const toast = Toast.create({ message: 'Something went wrong when casting vote', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  }

  if(!user) {
    return null;
  }

  return (
    <FadeIn key={postIndex}>
      <IonCard mode='ios'>
        <IonCardContent style={{ minHeight: "50vh" }}>
          <IonText color="medium">
            <IonAvatar
              class="posts-avatar"
              onClick={(e) => {
                e.stopPropagation();
                if(profileClickable !== false)
                  history.push("/about/" +schoolName + "/" + poll.uid);
              }}
            >
              <ProfilePhoto uid={post.uid}></ProfilePhoto>
            </IonAvatar>
            <p> {post.userName} </p>
          </IonText>
          <IonCardTitle style={{ fontSize: "1.35em", width: "95%", marginLeft: "0%" }}>{poll.question}</IonCardTitle>
          <br />
          <IonList lines="full" mode="ios">
            {poll.options.map((option: any, pollIndex: number) => {
              return (
                <IonItem style={{ fontWeight: "bold", fontSize: "0.95em" }} disabled={poll.voteMap[user!.uid] !== undefined || voteBeingCasted}
                  color={poll.voteMap[user!.uid] === pollIndex && schoolName !== "Cal Poly Humboldt" ? "primary" : poll.voteMap[user!.uid] === pollIndex && schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : poll.voteMap[user!.uid] === pollIndex && schoolName === "Cal Poly Humboldt" && !context.schoolColorToggled ? "primary" : ""}
                  key={pollIndex} mode="ios" lines="full" onClick={() => {
                    handlePollVote(pollIndex, poll.key);
                  }} >
                  <div style={{ width: "100%" }}>{option.text}</div> <p hidden={poll.voteMap[user!.uid] === undefined} slot="end">{Math.round(((poll.results[pollIndex] / poll.votes) * 100) * 10) / 10 + "%"}</p>
                </IonItem>
              )
            })}
          </IonList>
          <br />
          <IonFab vertical="bottom" horizontal="start">
            <p>{poll.votes} Votes &#183; Asked {getDate(poll.timestamp)}</p>
          </IonFab>
        </IonCardContent>
      </IonCard>
    </FadeIn>
  )
}