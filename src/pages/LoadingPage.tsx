// Ionic/Capacitor + React
import { IonContent, IonNote, IonPage, useIonRouter, useIonToast } from "@ionic/react";
import React from "react";
import { Network } from '@capacitor/network';
import { KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";

// Firebase/Google
import auth, { getCurrentUserData, updateAchievements } from "../fbConfig";

// Other imports/components
import { dynamicNavigate } from "../components/Shared/Navigation";
import tellU_logo from "../images/tellU_splash_2_1_2048x2048.png";

// CSS
import "../App.css";
import { useContext } from "../my-context";
import { Preferences } from "@capacitor/preferences";
import { Timestamp } from "firebase/firestore";

const LoadingPage = () => {
  console.log('loading page')

  // hooks
  const context = useContext();
  const router = useIonRouter();
  const [present] = useIonToast();
  const [isOffline, setIsOffline] = React.useState<boolean>(false);

  const presentAchievement = async (achievement: string): Promise<void> => {
    const achStr = achievement.replace(/\s+/g, '');
    await Preferences.set({ "key": achStr, value: "true" });
    present({
      message: 'You just unlocked the ' + achievement + ' achievement!',
      duration: 3500,
      position: 'top',
      buttons: [
        {
          text: 'Open',
          role: 'info',
          handler: () => { dynamicNavigate(router, '/achievements', 'forward'); }
        },
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => { }
        }
      ],
      cssClass: 'toast-options',
    });
  }

  const handleAchievements = async (): Promise<void> => {
    const userData = await getCurrentUserData();
    const tellUSovereignAchievement = await Preferences.get({ key: "tellUSovereign" });
    if (tellUSovereignAchievement && tellUSovereignAchievement.value !== 'true') {
      if (userData && "timestamp" in userData) {
        const serverTimestamp = Timestamp.now().toDate();
        const userTimestamp = new Timestamp(userData.timestamp.seconds, userData.timestamp.nanoseconds).toDate();
        const timeDifference = serverTimestamp.getTime() - userTimestamp.getTime();
        const millisecondsPerYear = 1000 * 60 * 60 * 24 * 365;
        if (timeDifference >= millisecondsPerYear) {
          console.log("A year or more has passed since the creation of the account");
          await Preferences.set( { key: "tellUSovereign", value: "true" } );
          updateAchievements('tellU Sovereign');
          presentAchievement("tellU Sovereign");
        } else {
          console.log("Less than a year has passed since the creation of the account");
        }
      }
    }
    if (userData && "achievements" in userData) {
      const listOfAchievements: string[] = userData["achievements"];
      for (let i = 0; i < listOfAchievements.length; ++i) {
        const achStr = listOfAchievements[i].replace(/\s+/g, '');
        await Preferences.set({ key: achStr, value: "true" });
      }
    }
  }

  /**
   * Auth state listener for Firebase auth
   * Sets tabs visibility based on auth state
   */
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("logged in");
        context.setShowTabs(true);
        await handleAchievements();
        dynamicNavigate(router, '/home', 'root');
      } else {
        const isOffline = await Network.getStatus();
        if (isOffline.connected) {
          console.log("logged out");
          context.setShowTabs(false);
          dynamicNavigate(router, '/landing-page', 'root');
        } else {
          setIsOffline(true);
        }
      }
    });
    return unsub;
  }, []);

  /**
   * Shows offline message if user has no connection
   */
  if (isOffline) { // TODO: return an offline image / animation
    return (
      <IonPage>
        <IonContent className="ion-padding" scrollY={false}>
          <div className="centered">
            <IonNote> You are offline. </IonNote>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  /**
   * Loading screen
   */
  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen style={{ "--background": "var(--ion-color-splash-screen-background)" }}>
        <div className="centered">
          <img style={{ scale: "2" }} src={tellU_logo} />
        </div>
      </IonContent>
    </IonPage>
  )
};

export default LoadingPage;