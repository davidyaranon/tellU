import { IonList, IonLabel, IonText, IonAvatar, IonItem } from "@ionic/react";
import { useHistory } from "react-router";
import ProfilePhoto from "../Shared/ProfilePhoto";
import { PostType } from "../Shared/PostType";
import { PostMessage } from "./PostMessage";
import PostImages from "../Shared/PostImages";
import { useContext } from "../../my-context";
import { LikeDislike } from "../Shared/LikeDislike";
import '../../App.css';
import { useCallback, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { useToast } from "@agney/ir-toast";
import FadeIn from "react-fade-in/lib/FadeIn";

export const HomePagePost = (props: any) => {
  const post = props.post;
  const index = props.index;
  const user = props.user;
  const hideLikeDislike = props.hideLikeDislike;
  let schoolName = props.schoolName;

  // hooks
  const history = useHistory();
  const context = useContext();
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
    <FadeIn key={index}>
      <IonList inset mode="ios">
        <IonItem lines="none" mode="ios" onClick={() => { history.push("/post/" + schoolName + "/" + post.userName + "/" + post.key); }}>
          <IonLabel>
            <IonText color="medium">
              <IonAvatar class="posts-avatar" onClick={(e) => { e.stopPropagation(); history.push("/about/" + schoolName + "/" + post.uid); }} >
                <ProfilePhoto uid={post.uid} />
              </IonAvatar>
              <p> {post.userName} </p>
            </IonText>
            <PostType schoolName={schoolName} type={post.postType} marker={post.marker} location={post.location} timestamp={post.timestamp} />
            <PostMessage schoolName={schoolName} message={post.message} classNumber={post.classNumber} className={post.className} reports={post.reports || 0} />
            <PostImages userName={post.userName} imgSrc={post.imgSrc || []} reports={post.reports || 0} />
          </IonLabel>
        </IonItem>
        <LikeDislike user={user} schoolName={schoolName} schoolColorToggled={context.schoolColorToggled} post={post} likes={post.likes} dislikes={post.dislikes} index={index} />
      </IonList>
    </FadeIn>
  )
}