import { RouteComponentProps, useHistory } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { db, getUserPhotoUrl } from "../fbConfig";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useToast } from "@agney/ir-toast";
import { IonCol, IonContent, IonPage, IonSpinner } from "@ionic/react";
import FadeIn from "react-fade-in/lib/FadeIn";
import "../App.css";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useCallback, useEffect, useState } from "react";
import { Toolbar } from "../components/Shared/Toolbar";
import { getDate } from "../helpers/timeago";
import { Virtuoso } from "react-virtuoso";

interface MatchUserPostParams {
  directMessageId: string;
  schoolName: string;
}

const DirectMessages = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const userUid = match.params.directMessageId;
  const schoolName = match.params.schoolName;
  const history = useHistory();
  const [user] = useAuthState(auth);
  const messagesRef = collection(db, 'userData', user?.uid || "", 'messages');
  const q = query(messagesRef, orderBy("date", "desc"), limit(100));
  const [messages, loading] = useCollectionData(q);
  const [contactPhotoUrls, setContactPhotoUrls] = useState<string[]>([]);
  const Toast = useToast();


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
      console.log({ messages });
      setContactPhotoUrls([]);
    }
  }, [messages]);

  useEffect(() => {
    console.log({ loading })
    console.log({ messages })
    if (!loading && messages && messages.length > 0) {
      console.log("running");
      handlePhotoUrls().catch((err) => { console.log(err); })
    }
  }, [loading, messages])

  return (
    <IonPage>
      <Toolbar title={"DMs"} schoolName={schoolName} />
      <IonContent fullscreen scrollX={false} scrollY={false}>

        {messages &&
          <Virtuoso
            overscan={1000}
            className="ion-content-scroll-host"
            totalCount={messages.length}
            itemContent={(index: number) => {
              let msg = messages[index];
              return (
                <FadeIn key={index}>
                  <div className="chat" key={msg.contactUid + '-' + index.toString()}
                    onClick={() => {
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
                        const toast = Toast.create({ message: 'Unable to open DMs', duration: 2000, color: 'toast-error' });
                        toast.present();
                      }
                      history.push("/chatroom/" + schoolName + "/" + elements[0] + '_' + elements[1])
                    }}>
                    <IonCol size="2">
                      <img className="chat_avatar" src={!contactPhotoUrls[index] || contactPhotoUrls[index] === "" ? msg.photoURL : contactPhotoUrls[index]} />
                    </IonCol>
                    <IonCol size="6.5">
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
                </FadeIn>
              )

            }}
            style={{ height: "100%" }}
          />
        }

        <div>

          {loading &&
            <div className="ion-spinner">
              <IonSpinner color={'primary'} />
            </div>
          }

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