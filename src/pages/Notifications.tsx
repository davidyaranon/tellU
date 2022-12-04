import {
  IonContent, IonSpinner, IonNote,
  IonFab, IonList, IonItem, IonText, IonPage, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, RouterDirection, useIonRouter
} from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import FadeIn from "react-fade-in";
import TimeAgo from "javascript-time-ago";
import { useHistory } from 'react-router';
import { useAuthState } from 'react-firebase-hooks/auth';
import auth, { getCurrentUserData, promiseTimeout } from '../fbconfig';
import { useToast } from '@agney/ir-toast';
import { chevronBackOutline } from 'ionicons/icons';
import { Virtuoso } from 'react-virtuoso';


/**
 * Notifications page containing a list of a user's past 30 notifications
 * Contains DM and post notifications
 */
export const Notifications = () => {

  /* Hooks */
  const history = useHistory();
  const router = useIonRouter();
  const [user, loading, error] = useAuthState(auth);
  const Toast = useToast();

  /* State Variables */
  const timeAgo = new TimeAgo("en-US");
  const [notifs, setNotifs] = useState<any[] | null>(null);

  /* Redux State */
  const schoolName = useSelector((state: any) => state.user.school);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);

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
          Toast.error("Trouble loading data");
        }
      });
      gotUserData.catch((err) => {
        Toast.error(err);
      });
    }
  }, []);

  /**
   * @description gets the formatted time since a notification was sent
   * 
   * @param {Date} timestamp 
   * @returns how long ago the notification was received
   */
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

  /**
   * @description navigates the user to a specified page
   * 
   * @param {string} path 
   * @param {RouterDirection} direction 
   */
  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }

  /**
   * Runs on page load
   */
  useEffect(() => {
    loadNotifications();
  }, [])

  if (notifs) {
    return (
      <IonPage className="ion-page-ios-notch">
        <IonContent fullscreen scrollY={false}>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios">
              <IonTitle>Notifications</IonTitle>
              <IonButtons style={{ marginLeft: "-2.5%" }}>
                <IonButton
                  color={
                    schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"
                  }
                  onClick={() => {
                    dynamicNavigate("user", "back");
                  }}
                >
                  <IonIcon icon={chevronBackOutline}></IonIcon> Back
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </div>
          <br /><br />
          <Virtuoso
            data={notifs.slice(0).reverse()}
            style={{ height: "100%" }}
            itemContent={(item) => {
              let notif = notifs[item];
              let index = item;
              if ("message" in notif && "chatroomString" in notif) {
                return (
                  <FadeIn key={"notif_" + notif.postKey + index.toString()}>
                    <IonList inset={true} mode="ios">
                      <IonItem lines="none" mode="ios" onClick={() => { history.push(notif.chatroomString); }}>
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
                  <FadeIn key={"notif_" + notif.postKey + index.toString()}>
                    <IonList inset={true} mode="ios">
                      <IonItem lines="none" mode="ios" onClick={() => { const key = notif.postKey.toString(); history.push("post/" + key); }}>
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
        <IonContent fullscreen scrollY={false}>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios">
              <IonTitle>Notifications</IonTitle>
              <IonButtons style={{ marginLeft: "-2.5%" }}>
                <IonButton
                  color={
                    schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"
                  }
                  onClick={() => {
                    dynamicNavigate("user", "back");
                  }}
                >
                  <IonIcon icon={chevronBackOutline}></IonIcon> Back
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </div>

          <br /> <br /> <br />
          <div style={{ textAlign: "center" }}>
            <IonSpinner color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} />
          </div>
        </IonContent>
      </IonPage>
    )
  }
}