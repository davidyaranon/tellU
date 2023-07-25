// Ionic/Capacitor + React
import { IonContent, IonNote, IonPage, useIonRouter } from "@ionic/react";
import React from "react";
import { Network } from '@capacitor/network';
import { Keyboard, KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";

// Firebase/Google
import auth from "../fbConfig";

// Other imports/components
import { dynamicNavigate } from "../components/Shared/Navigation";
import tellU_logo from "../images/tellU_splash_2_1_2048x2048.png";

// CSS
import "../App.css";
import { useContext } from "../my-context";

const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
}

const LoadingPage = () => {
  console.log('loading page')

  // hooks
  const context = useContext();
  const router = useIonRouter();
  const [isOffline, setIsOffline] = React.useState<boolean>(false);

  // React.useEffect(() => {
  //   context.setDarkMode(true);
  //   document.body.classList.toggle("dark");
  //   context.setDarkMode(true);
  //   Keyboard.setStyle(keyStyleOptionsDark);
  //   StatusBar.setStyle({ style: Style.Dark });
  // }, [context]);

  /**
   * Auth state listener for Firebase auth
   * Sets tabs visibility based on auth state
   */
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("logged in");
        context.setShowTabs(true);
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
        <IonContent className="ion-padding">
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
      <IonContent fullscreen style={{ "--background": "var(--ion-color-splash-screen-background)" }}>
        <div className="centered">
          <img style={{ scale: "2" }} src={tellU_logo} />
        </div>
      </IonContent>
    </IonPage>
  )
};

export default LoadingPage;