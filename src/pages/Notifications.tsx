import {
  IonContent, IonSpinner, IonNote,
  IonFab, IonList, IonItem, IonText, IonPage
} from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import FadeIn from "react-fade-in/lib/FadeIn";
import { useHistory } from 'react-router';
import { useAuthState } from 'react-firebase-hooks/auth';
import auth, { getCurrentUserData, promiseTimeout } from '../fbConfig';
import { useToast } from '@agney/ir-toast';
import { Virtuoso } from 'react-virtuoso';
import { Toolbar } from '../components/Shared/Toolbar';
import { getDate } from '../helpers/timeago';
import { useContext } from '../my-context';


/**
 * Notifications page containing a list of a user's past 30 notifications
 * Contains DM and post notifications
 */
export const Notifications = () => {

  /* Hooks */
  const history = useHistory();
  const [user, loading, error] = useAuthState(auth);
  const Toast = useToast();
  const context = useContext();

  /* State Variables */
  const [notifs, setNotifs] = useState<any[] | null>(null);

  /**
   * @description Loads user notifications from Firestore
   */
  const loadNotifications = useCallback(() => {
    if (user && user.uid) {
      const gotUserData = promiseTimeout(7500, getCurrentUserData());
      gotUserData.then((res: any) => {
        if (res) {
          res.notifs.sort(function (a: any, b: any) {
            var keyA = new Date(a.date), keyB = new Date(b.date);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });
          setNotifs(res.notifs);
        } else {
          const toast = Toast.create({ message: 'Trouble getting data', duration: 2000, color: 'toast-error' });
          toast.present();
        }
      });
      gotUserData.catch((err) => {
        Toast.error(err);
      });
    }
  }, []);

  /**
   * Runs on page load
   */
  useEffect(() => {
    loadNotifications();
  }, [])

  if (notifs) {
    return (
      <IonPage>
        <Toolbar title="Notifications" />
        <IonContent fullscreen scrollY={false}>
          <Virtuoso
            data={notifs.slice(0).reverse()}
            style={{ height: "100%" }}
            itemContent={(item) => {
              let notif = notifs[item];
              let index = item;
              if ("message" in notif && "chatroomString" in notif) {
                return (
                  <FadeIn key={"chatnotif_" + notif.postKey + index.toString()}>
                    <IonList inset={true} mode="ios">
                      <IonItem lines="none" mode="ios" onClick={() => {
                        let url: string = '';
                        let chatroomString : string = notif.chatroomString;
                        if (chatroomString.includes("chatroom")) {
                          url = notif.chatroomString.slice(0, 9) + "/Cal%20Poly%20Humboldt" + notif.chatroomString.slice(9);
                        } else {
                          url = notif.chatroomString.slice(0, 5) + "/Cal%20Poly%20Humboldt" + notif.chatroomString.slice(9);
                        }
                        history.push(url);
                      }}>
                        <IonFab horizontal="end" vertical="top">
                          <IonNote style={{ fontSize: "0.75em" }}>
                            {" "}
                            {getDate(notif.date)}{" "}
                          </IonNote>
                        </IonFab>
                        <IonText>
                          <div style={{ height: "4vh" }}>{" "}</div>
                          <div style={{ fontWeight: "bold" }}>
                            {notif.userName + " sent a DM: "}
                          </div>
                          {notif.message}
                          <div style={{ height: "1vh" }}>{" "}</div>
                        </IonText>
                      </IonItem>
                    </IonList>
                  </FadeIn>
                )
              } else {
                return (
                  <FadeIn key={"postnotif_" + notif.postKey + index.toString()}>
                    <IonList inset={true} mode="ios">
                      <IonItem lines="none" mode="ios" onClick={() => { 
                        const key = notif.postKey.toString(); history.push("post/Cal%20Poly%20Humboldt/" + encodeURIComponent(notif.userName) + '/' + key); }}>
                        <IonFab horizontal="end" vertical="top">
                          <IonNote style={{ fontSize: "0.75em" }}>
                            {" "}
                            {getDate(notif.date)}{" "}
                          </IonNote>
                        </IonFab>
                        <IonText>
                          <div style={{ height: "4vh" }}>{" "}</div>
                          <div style={{ fontWeight: "bold" }}>
                            {notif.userName + " commented: "}
                          </div>
                          {notif.comment}
                          <div style={{ height: "1vh" }}>{" "}</div>
                        </IonText>
                      </IonItem>
                    </IonList>
                  </FadeIn>
                )
              }
            }} />
        </IonContent >
      </IonPage >
    )
  } else {
    return (
      <IonPage className="ion-page-ios-notch">
        <Toolbar title="Notifications" />
        <IonContent fullscreen scrollY={false}>

          <br /> <br /> <br />
          <div style={{ textAlign: "center" }}>
            <IonSpinner color={context.schoolColorToggled ? "tertiary" : "primary"} />
          </div>
        </IonContent>
      </IonPage>
    )
  }
}