import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { getUserPhotoUrl } from '../fbconfig';
import { db } from "../fbconfig";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useToast } from "@agney/ir-toast";
import {
  IonButton, IonButtons, IonCol, IonContent, IonIcon, IonPage,
  IonSpinner,
  IonTitle, IonToolbar, RouterDirection, useIonRouter, useIonViewWillEnter
} from "@ionic/react";
import FadeIn from "react-fade-in";
import "../App.css";
import TimeAgo from "javascript-time-ago";
import { chevronBackOutline } from "ionicons/icons";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { setNotif } from "../redux/actions";
import { useCallback, useEffect, useState } from "react";

interface MatchUserPostParams {
  directMessageId: string;
}

const DirectMessages = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const userUid = match.params.directMessageId;
  const schoolName = useSelector((state: any) => state.user.school);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const router = useIonRouter();
  const [user] = useAuthState(auth);
  const messagesRef = collection(db, 'userData', user?.uid || "", 'messages');
  const q = query(messagesRef, orderBy("date", "desc"), limit(100));
  const [messages, loading] = useCollectionData(q);
  const [contactPhotoUrls, setContactPhotoUrls] = useState<string[]>([]);
  const timeAgo = new TimeAgo("en-US");
  const Toast = useToast();
  const dispatch = useDispatch();

  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }
  const navigateBack = () => {
    if (router.canGoBack()) {
      router.goBack();
    } else {
      dynamicNavigate('home', 'back');
    }
  }

  const getDate = (timestamp: any) => {
    if (!timestamp) {
      return '';
    }
    if ("seconds" in timestamp && "nanoseconds" in timestamp) {
      const time = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      );
      return timeAgo.format(time);
    } else {
      return '';
    }
  };

  useIonViewWillEnter(() => {
    dispatch(setNotif(false));
  })

  const handlePhotoUrls = useCallback(async () => {
    if (messages && messages.length > 0) {
      let urls: string[] = [];
      console.log("running loop");
      for (let i = 0; i < messages.length; ++i) {
        const photoUrl = await getUserPhotoUrl(messages[i].contactUid);
        urls.push(photoUrl);
      }
      setContactPhotoUrls([...urls]);
    } else {
      console.log("messages null");
      console.log({messages});
      setContactPhotoUrls([]);
    }
  }, [messages]);

  useEffect(() => {
    console.log({loading})
    console.log({messages})
    if (!loading && messages && messages.length > 0) {
      console.log("running");
      handlePhotoUrls().catch((err) => { console.log(err); })
    }
  }, [loading, messages])

  return (
    <IonPage>
      <IonContent scrollEvents>

        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios">
            <IonTitle>DMs</IonTitle>
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonButton
                color={
                  schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"
                }
                onClick={() => {
                  navigateBack();
                }}
              >
                <IonIcon icon={chevronBackOutline}></IonIcon> Back
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>

        <div className='ion-modal'>
          <br /><br />

          {loading &&
            <div className="ion-spinner">
              <IonSpinner
                color={
                  schoolName === "Cal Poly Humboldt"
                    && schoolColorToggled
                    ? "tertiary"
                    : "primary"
                }
              />
            </div>
          }
          <FadeIn>
            {
              messages && messages.length > 0 &&
              messages.map((msg: any, index: number) => {
                return (
                  <div className="chat" key={msg.contactUid + '-' + index.toString()} onClick={() => {
                    let elements: any[] = [];
                    if (userUid && msg.contactUid) {
                      if (userUid < msg.contactUid) {
                        elements.push(msg.contactUid);
                        elements.push(userUid);
                      } else {
                        elements.push(userUid);
                        elements.push(msg.contactUid);
                      }
                      // console.log(elements[0] + '_' + elements[1]);
                    } else {
                      Toast.error("Unable to open DMs");
                    }
                    dynamicNavigate("/chatroom/" + elements[0] + '_' + elements[1], 'forward')
                  }
                  }>
                    <IonCol size="2">
                      <img className="chat_avatar" src={!contactPhotoUrls[index] || contactPhotoUrls[index] === "" ? msg.photoURL : contactPhotoUrls[index]} />
                    </IonCol>
                    <IonCol size="7">
                      <div className="chat_info">
                        <div className="contact_name">{msg.userName}</div>
                        <div className={"read" in msg && msg.read === false ? "contactMsgBold" : "contactMsg"}>{msg.recent.length > 50 ?
                          msg.recent.slice(0, 50) + "..."
                          : msg.recent.length == 0 ?
                            '[picture]'
                            : msg.recent}
                        </div>
                      </div>
                    </IonCol>
                    <IonCol size="3.5">
                      <div className="chat_date">{getDate(msg.date)}</div>
                      {"read" in msg && msg.read == false && <div className="chat_new grad_pb">Reply</div>}
                    </IonCol>
                  </div>
                )
              })
            }
          </FadeIn>
          {messages && messages.length == 0 &&
            <div className="ion-spinner">
              <p>Send a DM!</p>
            </div>
          }
        </div>
      </IonContent>
    </IonPage>
  )
};

export default DirectMessages;