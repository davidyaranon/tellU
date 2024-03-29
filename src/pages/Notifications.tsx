import {
  IonContent, IonSpinner, IonNote,
  IonFab, IonItem, IonText, IonPage
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
import { Preferences } from '@capacitor/preferences';


/**
 * Notifications page containing a list of a user's past 30 notifications
 * Contains DM and post notifications
 */
export const Notifications = () => {

  /* Hooks */
  const history = useHistory();
  const [user, loading, error] = useAuthState(auth);
  const [schoolName, setSchoolName] = useState<string>('');
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
      gotUserData.then(async (res: any) => {
        const school = await Preferences.get({ key: "school" });
        if (school && school.value && res) {
          res.notifs.sort(function (a: any, b: any) {
            var keyA = new Date(a.date), keyB = new Date(b.date);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });
          console.log(school.value);
          console.log(encodeURIComponent(school.value));
          setSchoolName(encodeURIComponent(school.value));
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

          {notifs && notifs.length == 0 &&
            <div className="ion-spinner">
              <p>No notifications</p>
            </div>
          }

          <Virtuoso
            data={notifs.slice(0).reverse()}
            style={{ height: "100%" }}
            className="ion-content-scroll-host"
            itemContent={(item) => {
              let notif = notifs[item];
              let index = item;
              if ("message" in notif && "chatroomString" in notif) {
                return (
                  <FadeIn key={"chatnotif_" + notif.postKey + index.toString()}>
                    <IonItem style={context.darkMode ? { '--background': '#0D1117' } : { '--background': '#FFFFFF' }} lines='full' mode="ios" onClick={() => {
                      let url: string = '';
                      let chatroomString: string = notif.chatroomString;
                      console.log("Chatroom string: " + chatroomString);
                      if (chatroomString.includes("chatroom")) {
                        console.log('included');
                        url = notif.chatroomString.slice(0, 9) + "/" + notif.chatroomString.slice(9);
                      } else {
                        console.log('not included');
                        url = notif.chatroomString.slice(0, 5) + "/" + notif.chatroomString.slice(9);
                      }
                      console.log("url after: " + url);
                      history.push(chatroomString);
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
                  </FadeIn>
                )
              } else {
                return (
                  <FadeIn key={"postnotif_" + notif.postKey + index.toString()}>
                    <IonItem style={context.darkMode ? { '--background': '#0D1117' } : { '--background': '#FFFFFF' }} lines='full' mode="ios" onClick={() => {
                      const key = notif.postKey.toString(); console.log("/post/" + schoolName + "/" + encodeURIComponent(notif.userName) + '/' + key); history.push("/post/" + schoolName + "/" + encodeURIComponent(notif.userName) + '/' + key);
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
                          {notif.userName + " commented: "}
                        </div>
                        {notif.comment}
                        <div style={{ height: "1vh" }}>{" "}</div>
                      </IonText>
                    </IonItem>
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
          <div className="ion-spinner">
            <IonSpinner color={"primary"} />
          </div>
        </IonContent>
      </IonPage>
    )
  }
}