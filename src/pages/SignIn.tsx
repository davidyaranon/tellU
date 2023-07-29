/* React imports */
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router';

/* Ionic/Capacitor */
import { KeyboardResizeOptions, Keyboard, KeyboardResize } from "@capacitor/keyboard";
import {
  IonContent, IonHeader, IonButton, IonItem, IonSpinner, IonPage,
  IonLabel, useIonRouter, useIonLoading, useIonViewWillEnter, IonText, IonInput, IonIcon
} from '@ionic/react';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';

/* Firebase */
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import auth, { logInWithEmailAndPassword, db, getUserInfo } from '../fbConfig';

/* CSS + Other components */
import '../App.css';
import Header from "../../resources/components/Shared/Header";
import { useToast } from "@agney/ir-toast";
import { dynamicNavigate } from '../../resources/components/Shared/Navigation';
import { Preferences } from '@capacitor/preferences';
import { useContext } from '../my-context';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toolbar } from '../../resources/components/Shared/Toolbar';

/* global variables */
const defaultResizeOptions: KeyboardResizeOptions = { mode: KeyboardResize.Body }
const inputNote: React.CSSProperties = {
  fontSize: "0.85em",
  textAlign: "right",
  color: "gray",
  fontFamily: "Arial",
  marginTop: "-1.5vh",
  marginRight: "7.5vw"
}

export const SignIn = () => {
  // state variables
  const [busy, setBusy] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);

  // hooks
  const Toast = useToast();
  const history = useHistory();
  const emailRef = useRef<HTMLIonInputElement>(null);
  const passwordRef = useRef<HTMLIonInputElement>(null);
  const [present, dismiss] = useIonLoading();
  const router = useIonRouter();
  const context = useContext();

  /**
  * @description Handles login using provided email and password
  * Redirects to Home page upon success
  * Toasts error upon incorrect credentials
  */
  const login = async () => {
    await Preferences.clear();
    const emailRefValue = emailRef.current;
    const passwordRefValue = passwordRef.current;
    if (emailRefValue && passwordRefValue) {
      const email = emailRefValue.value;
      const password = passwordRefValue.value;
      if (!email) {
        const toast = Toast.create({ message: 'Enter an email address', duration: 2000, color: 'toast-error' });
        toast.present();
        return;
      }
      if (!password) {
        const toast = Toast.create({ message: 'Enter a password', duration: 2000, color: 'toast-error' });
        toast.present();
        return;
      }
      present({
        message: "Logging In...",
        duration: 0
      });
      const res = await logInWithEmailAndPassword(email.toString(), password.toString()).catch((err) => {
        console.log(err);
        Toast.error(err);
      });
      if (res) {
        console.log(res.email);
        const info = await getUserInfo(res.uid);
        console.log(info);
        if (info && "school" in info && info.school.length > 0) {
          await Preferences.set({ key: "school", value: info.school });
        }
        const toast = Toast.create({ message: 'Logging In...', duration: 2000, color: 'toast-success' });
        toast.present();
        toast.dismiss();
        dynamicNavigate(router, "/home", "root");
        window.location.reload();
        dismiss();
      } else {
        const toast = Toast.create({ message: 'Invalid credentials', duration: 2000, color: 'toast-error' });
        toast.present();
      }
      dismiss();
    } else {
      const toast = Toast.create({ message: 'Unable to login, check your input method/device', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  }

  const setSchool = React.useCallback(async (school: string) => {
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

  /**
   * Hides splash screen on mount
   */
  React.useEffect(() => {
    SplashScreen.hide();
  }, []);

  React.useEffect(() => {
    context.setShowTabs(false);
  }, []);

  useIonViewWillEnter(() => {
    context.setShowTabs(false);
  });

  if (busy) {
    return (<IonSpinner className='ion-spinner' name="dots" color="primary" />);
  }

  return (
    <IonPage>
      <Toolbar color="primary" text={'Back'}/>
      <IonContent scrollY={false}>
        <IonHeader className='ion-no-border' style={{ padding: "5vh" }}>
          <Header darkMode={context.darkMode} schoolName="" zoom={1.1} style={{ fontWeight: "bold", margin: 0 }} />
          <p style={{ textAlign: "center", fontSize: "1.5em", fontFamily: 'Arial' }}>Sign In</p>
        </IonHeader>

        <IonLabel id="email-label" className="login-label">Email</IonLabel>
        <IonItem className='login-input'>
          <IonInput aria-labelledby="email-input" type="email" ref={emailRef} placeholder="email@email.com" />
        </IonItem>

        <IonLabel id="password-label" className="login-label">Password</IonLabel>
        <IonItem className='login-input'>
          <IonInput aria-labelledby='password-label' clearInput clearOnEdit={false} type={showPassword ? "text" : "password"} ref={passwordRef} placeholder="••••••••" />
          <IonButton slot="end" fill="clear" onClick={() => { setShowPassword(!showPassword) }}>
            <IonIcon color="medium" icon={showPassword ? eyeOutline : eyeOffOutline} />
          </IonButton>
        </IonItem>
        <p style={inputNote}><IonText onClick={() => { dynamicNavigate(router, '/forgot-password', 'forward') }}>forgot your password?</IonText></p>

        <div style={{ height: "5%" }} />

        <IonButton className="login-button" onClick={() => { login(); }} fill="clear" expand="block" id="signInButton" >Sign In</IonButton>
        <div style={{ height: "1%" }} />

      </IonContent>
    </IonPage>
  )
}