import { IonContent, IonHeader, IonButton, IonInput, IonItem, IonSpinner, IonList, IonPage, IonLoading } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import auth, { promiseTimeout } from '../fbconfig';
import { logInWithEmailAndPassword, db } from '../fbconfig'
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Header from "./Header"
import '../App.css'
import { useHistory } from 'react-router';
import UIContext from '../my-context'
import { useToast } from "@agney/ir-toast";
import { useDispatch, useSelector } from "react-redux"
import { setUserState } from '../redux/actions';
import { timeout } from '../components/functions';
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { KeyboardResizeOptions, Keyboard, KeyboardResize } from "@capacitor/keyboard";

const defaultResizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.Native,
}

const LandingPage: React.FC = () => {
  const dispatch = useDispatch();
  const Toast = useToast();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const [busy, setBusy] = useState<boolean>(false);
  const { setShowTabs } = React.useContext(UIContext);
  const [emailSignIn, setEmailSignIn] = useState("");
  const [passwordSignIn, setPasswordSignIn] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const history = useHistory();

  async function logIn() {
    if (emailSignIn.trim().length == 0 || passwordSignIn.length == 0) {
      Toast.error("Enter both an email and a password");
      setLoggingIn(false);
    }
    else {
      const didLogIn = promiseTimeout(10000, logInWithEmailAndPassword(emailSignIn.trim(), passwordSignIn));
      didLogIn.then((res) => {
        if (!res) { Toast.error("Unable to login"); setBusy(false); setLoggingIn(false); }
        else {
          let school = "";
          const userRef = doc(db, "userData", res.user.uid);
          getDoc(userRef).then((userSnap) => {
            if (userSnap.exists()) {
              school = userSnap.data().school;
            }
            dispatch(setUserState(res.user.displayName, res.user.email, false, school));
            Toast.success("Logged In!");
            FCM.deleteInstance().then(() => console.log("FCM instance deleted")).catch((err) => console.log(err));
            PushNotifications.register().then(() => {
              FCM.subscribeTo({ topic: "commentNotifications" }).then(() => {
                console.log("subscribed to comment notifications");
              }).catch((err) => { console.error(err); })
              FCM.getToken().then((r) => { console.log(r.token); }).catch((err) => console.error(err));
              setBusy(false);
              setLoggingIn(false);
            });
          }).catch((err) => {
            console.log(err);
            dispatch(setUserState(res.user.displayName, res.user.email, false, ""));
            setBusy(false);
            setLoggingIn(false);
          });
        }
      });
      didLogIn.catch((err) => {
        Toast.error(err);
        setLoggingIn(false);
        setBusy(false);
      });
    }
    setBusy(false);
  }

  useEffect(() => {
    setBusy(true);
    if (user) {
      let school = "";
      const userRef = doc(db, "userData", user.uid);
      getDoc(userRef).then((userSnap) => {
        if (userSnap.exists()) {
          school = userSnap.data().school;
        }
        dispatch(setUserState(user.displayName, user.email, false, school));
        setBusy(false);
        history.replace("/home");
      }).catch((err) => {
        console.log(err);
        dispatch(setUserState(user.displayName, user.email, false, ""));
        setBusy(false);
        history.replace("/home");
      });
    }
    setShowTabs(false);
    setBusy(false);
    return () => {
      setShowTabs(true);
      setBusy(false);
    }
  }, [user, loading]);

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      Keyboard.setResizeMode(defaultResizeOptions);
    });
    return() => {
      Keyboard.removeAllListeners();
    };
  })

  if (busy) {
    return (<IonSpinner class='ion-spinner' name="dots" color="primary" />);
  }
  else {
    return (
      <IonPage>
        <IonContent >
          {loggingIn ? (
            <IonLoading
              spinner="dots"
              message="Logging In"
              duration={0}
              isOpen={loggingIn}
            ></IonLoading>
          ) : (null)}
          <IonHeader class="ion-no-border" style={{ padding: "5vh" }}>
            <Header darkMode={darkModeToggled} />
          </IonHeader>

          <IonList inset={true} mode='ios' className='sign-in-sign-up-list'>
            <IonItem mode='ios' >
              <IonInput clearInput={true} color="transparent" mode='ios' value={emailSignIn} type="email" placeholder="Email" id="emailSignIn" onIonChange={(e: any) => { setEmailSignIn(e.detail.value); }} ></IonInput>
            </IonItem>
            <IonItem mode='ios' >
              <IonInput color="transparent" mode='ios' clearOnEdit={false} value={passwordSignIn} type="password" placeholder="Password" id="passwordSignIn" onIonChange={(e: any) => setPasswordSignIn(e.detail.value)} ></IonInput>
            </IonItem>
            <br />
            <IonButton color="transparent" mode='ios' onClick={() => { setLoggingIn(true); logIn(); }} shape="round" fill="outline" expand="block" id="signInButton" >Sign In</IonButton>
            <br />
            <br />
          </IonList>
          <p className='sign-in-sign-up-list'> or <Link to="/register">register</Link> for an account</p>
        </IonContent>
      </IonPage>
    )
  }

}

export default React.memo(LandingPage);