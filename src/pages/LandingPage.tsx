/* React imports */
import React, { useState } from 'react';
import { useHistory } from 'react-router';

/* Ionic/Capacitor */
import { KeyboardResizeOptions, Keyboard, KeyboardResize } from "@capacitor/keyboard";
import {
  IonContent, IonButton, IonSpinner, IonPage, useIonRouter, useIonViewWillEnter, IonFooter, IonText, IonHeader
} from '@ionic/react';

/* Firebase */
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { db } from '../fbConfig';

/* CSS + Other components */
import '../App.css';
import Header from "../components/Shared/Header";
import { dynamicNavigate } from '../components/Shared/Navigation';
import { Preferences } from '@capacitor/preferences';
import { useContext } from '../my-context';
import { SplashScreen } from '@capacitor/splash-screen';
import { timeout } from '../helpers/timeout';


/* global variables */
const defaultResizeOptions: KeyboardResizeOptions = { mode: KeyboardResize.Body }

const LandingPage = () => {

  console.log('landing page');

  // state variables
  const [busy, setBusy] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);

  const history = useHistory();
  const router = useIonRouter();
  const context = useContext();


  const setSchool = React.useCallback(async (school: string) => {
    console.log('setting ' + school + " \n on ladning page");
    await Preferences.set({ key: "school", value: school });
  }, []);

  React.useEffect(() => {
    setBusy(true);
    if (user) {
      Preferences.get({ key: "school" }).then((res) => {
        if (res.value) {
          console.log(res.value);
          setBusy(false);
          dynamicNavigate(router, '/home', 'root');
        } else {
          let school = "";
          const userRef = doc(db, "userData", user.uid);
          getDoc(userRef).then((userSnap) => {
            if (userSnap.exists()) {
              school = userSnap.data().school;
              console.log(school);
              setSchool(school);
            }
            setBusy(false);
            dynamicNavigate(router, 'home', 'root');
          });
        }
      }).catch((err) => {
        console.log(err);
        setBusy(false);
        history.replace("/home");
      });
    }
    setBusy(false);
    return () => {
      setBusy(false);
    }
  }, [user, loading]);


  /**
   * Keyboard event listener useEffect
   */
  React.useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      Keyboard.setResizeMode(defaultResizeOptions);
    });
    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);

  const hideSplashScreen = React.useCallback(async () => {
    await timeout(250);
    SplashScreen.hide();
  }, []);

  /**
   * Hides splash screen on mount
   */
  React.useEffect(() => {
    hideSplashScreen();
  }, []);

  React.useEffect(() => {
    context.setShowTabs(false);
  }, []);

  useIonViewWillEnter(() => {
    context.setShowTabs(false);
  });

  if (busy) {
    return (<IonSpinner class='ion-spinner' name="dots" color="primary" />);
  }

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div style={{ height: "15vh" }} />

        <IonHeader className="ion-no-border" style={{ paddingBottom: "5vh" }}>
          <Header darkMode={context.darkMode} schoolName="" zoom={1.1} style={{ fontWeight: "bold", margin: 0 }} />
          <p style={{ textAlign: "center", fontSize: "1.5em", fontFamily: 'Arial' }}>University Chats</p>
        </IonHeader>

        <div style={{ height: "30%" }} />

        <IonFooter>
          <div>
            <IonButton className="login-button" fill="clear" expand="block" id="signInButton" onClick={() => dynamicNavigate(router, '/sign-in', 'forward')}>Sign In</IonButton>
          </div>
          <div style={{ height: "1vh" }} />
          <div>
            <IonButton className="login-button" fill="clear" expand="block" id="signInButton" onClick={() => dynamicNavigate(router, '/register', 'forward')}>Register</IonButton>
          </div>
        </IonFooter>

      </IonContent>
    </IonPage>
  )

}

export default LandingPage;