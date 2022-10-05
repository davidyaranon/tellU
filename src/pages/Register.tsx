/* React imports */
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setUserState } from "../redux/actions";

/* Ionic/Capacitor */
import {
  IonContent, IonHeader, IonButton, IonLoading, IonInput, IonButtons,
  IonCard, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonModal,
  IonToolbar, IonTitle, IonPage, useIonViewDidEnter
} from "@ionic/react";
import { PushNotifications } from "@capacitor/push-notifications";
import { KeyboardResizeOptions, Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { FCM } from "@capacitor-community/fcm";

/* Firebase */
import auth, { updateNotificationsToken } from '../fbconfig';
import { registerWithEmailAndPassword, checkUsernameUniqueness, db } from "../fbconfig";
import { doc, getDoc } from "firebase/firestore";

/* CSS + Other components */
import "../App.css";
import Header from "./Header";
import UIContext from "../my-context";
import { useToast } from "@agney/ir-toast";

/* Global variables */
const capitalLetters = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/;
const emojis = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
const numbers = /[0123456789]/;
const defaultResizeOptions: KeyboardResizeOptions = { mode: KeyboardResize.Native }

const Register: React.FC = () => {

  // state variables
  const [emailSignUp, setEmailSignUp] = useState("");
  const [userNameSignUp, setUserNameSignUp] = useState("");
  const [passwordSignUp, setPasswordSignUp] = useState("");
  const [passwordSignUpCopy, setPasswordSignUpCopy] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolEmailEnding, setSchoolEmailEnding] = useState("");
  const [user, loading] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [passwordModal, setPasswordModal] = useState<boolean>(false);

  const Toast = useToast();
  const dispatch = useDispatch();
  const history = useHistory();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const { setShowTabs } = React.useContext(UIContext);

  /**
   * Uses Firebase Auth to register using 
   * email (emailSignUp) and password (passwordSignUp)
   * 
   * User input must meet certain requirements
   */
  async function register() {
    setBusy(true);
    if (schoolName) {
      var idx = emailSignUp.lastIndexOf('@');
      if (idx > -1 && (emailSignUp.slice(idx + 1)).toLowerCase() === schoolEmailEnding) {
        // console.log('school matches email');
      } else {
        Toast.error('Use your university\'s email address!');
        setBusy(false);
        return;
      }
    }
    if (
      userNameSignUp.trim() === "" ||
      passwordSignUp.trim() === "" ||
      emailSignUp.trim() === ""
    ) {
      Toast.error("Enter a value in each field");
    } else if (schoolName.length == 0) {
      Toast.error("Select a university!");
    } else if (((emailSignUp.trim() || '').match(emojis) || []).length > 0) {
      Toast.error("Email cannot contain emojis ");
    } else if (((userNameSignUp.trim() || '').match(emojis) || []).length > 0) {
      Toast.error("Username cannot contain emojis!");
    } else if (userNameSignUp.trim().length > 15) {
      Toast.error("Username must be no more than 15 characters!");
    } else if (passwordSignUp !== passwordSignUpCopy) {
      Toast.error("Passwords do not match!");
    } else if (passwordSignUp.length < 8) {
      Toast.error("Password must be 8 or more characters!");
    } else if (userNameSignUp.includes(" ")) {
      Toast.error("Username cannot contain spaces!");
    } else if (passwordSignUp.includes(" ")) {
      Toast.error("Password cannot contain spaces!");
    } else if (!capitalLetters.test(passwordSignUp)) {
      Toast.error("Password must contain at least 1 capital character");
    } else if (!numbers.test(passwordSignUp)) {
      Toast.error("Password must contain at least 1 number");
    } else {
      
      const isUnique = await checkUsernameUniqueness(userNameSignUp.trim());
      if (!isUnique) {
        Toast.error("Username has been taken!");
      } else {
        const res = await registerWithEmailAndPassword(
          userNameSignUp.trim(),
          emailSignUp.trim(),
          passwordSignUp,
          schoolName
        );
        if (typeof res === "string") {
          Toast.error(res);
        } else {
          let notificationsToken = localStorage.getItem("notificationsToken") || "";
          if(notificationsToken.length <= 0) {
            FCM.deleteInstance().then(() => console.log("FCM instance deleted")).catch((err) => console.log(err));
            FCM.getToken().then((token) => {
              localStorage.setItem("notificationsToken", token.token);
              updateNotificationsToken(token.token);
            });
          } else {
            updateNotificationsToken(notificationsToken);
          }
          dispatch(
            setUserState(
              res!.user.displayName,
              res!.user.email,
              false,
              schoolName
            )
          );
          Toast.success("Registered Successfully");
        }
      }
    }
    setBusy(false);
  }

  /**
   * Run when page is loaded into view
   */
  useIonViewDidEnter(() => {
    setBusy(true);
    if (user) {
      let school = "";
      const userRef = doc(db, "userData", user.uid);
      getDoc(userRef)
        .then((userSnap) => {
          if (userSnap.exists()) {
            school = userSnap.data().school;
          }
          dispatch(setUserState(user.displayName, user.email, false, school));
          setBusy(false);
          history.replace("/home");
        })
        .catch((err) => {
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
    };
  }, [user, loading]);


  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      Keyboard.setResizeMode(defaultResizeOptions);
    });
    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);


  const openPasswordRequirements = () => {
    setPasswordModal(true);
  };

  const closeModal = () => {
    setPasswordModal(false);
  };

  const handleUsernameInput = (e: any) => {
    setUserNameSignUp(e.detail.value);
  }

  return (
    <IonPage>
      <IonContent>
        <IonHeader class="ion-no-border" style={{ padding: "5vh" }}>
          <Header darkMode={darkModeToggled} schoolName="" zoom={1.2} />
        </IonHeader>

        <IonLoading
          message="Please wait..."
          duration={0}
          isOpen={busy}
        ></IonLoading>

        <IonModal
          showBackdrop={true}
          isOpen={passwordModal}
          onDidDismiss={closeModal}
          breakpoints={[0, 0.75, 0.95]}
          initialBreakpoint={0.75}
          backdropBreakpoint={0.2}
        >
          <IonContent>
            <IonHeader translucent>
              <IonToolbar mode="ios">
                <IonTitle>Sign-up Requirements</IonTitle>
                <IonButtons slot="end">
                  <IonButton mode="ios" onClick={closeModal}>
                    Close
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <br></br>
            <IonHeader mode="ios">
              <IonTitle>Username</IonTitle>
            </IonHeader>
            <br></br>
            <IonCard>
              <IonItem lines="none" class="ion-item-style">
                - Must be no more than 15 charaters
              </IonItem>
            </IonCard>
            <br></br>
            <IonHeader mode="ios">
              <IonTitle>Password</IonTitle>
            </IonHeader>
            <br></br>
            <IonCard>
              <IonItem lines="none" class="ion-item-style">
                - Must be at least 8 charaters
              </IonItem>
              <IonItem lines="none" class="ion-item-style">
                - Must contain at least 1 number (0-9) <wbr></wbr>
              </IonItem>
              <IonItem lines="none" class="ion-item-style">
                - Must contain a capital letter
              </IonItem>
              <IonItem lines="none" class="ion-item-style">
                - No spaces <br></br>
                <wbr></wbr>
              </IonItem>
            </IonCard>
          </IonContent>
        </IonModal>

        <IonList mode="ios" inset={true} className="sign-in-sign-up-list">
          <IonItem class="ion-item-style">
            <IonLabel position="stacked">School Email</IonLabel>
            <IonInput
              clearInput={true}
              value={emailSignUp}
              type="email"
              placeholder="email@email.com"
              id="emailSignUp"
              onIonChange={(e: any) => setEmailSignUp(e.detail.value)}
            ></IonInput>
          </IonItem>
          <IonItem class="ion-item-style">
            <IonLabel position="stacked">University</IonLabel>
            <IonSelect
              value={schoolName}
              placeholder="University of California"
              onIonChange={(e: any) => { 
                setSchoolName(e.detail.value); 
                if(e.detail.value == 'Cal Poly Humboldt') {
                  setSchoolEmailEnding('humboldt.edu');
                } else if(e.detail.value == 'UC Berkeley') {
                  setSchoolEmailEnding('berkeley.edu');
                } else if (e.detail.value == 'UC Davis') {
                  setSchoolEmailEnding('ucdavis.edu');
                } else if (e.detail.value == 'UC Irvine') {
                  setSchoolEmailEnding('uci.edu');
                } else if (e.detail.value == 'UCLA') {
                  setSchoolEmailEnding('ucla.edu');
                } else if (e.detail.value == 'UC Merced') {
                  setSchoolEmailEnding('ucmerced.edu');
                } else if (e.detail.value == 'UC Riverside') {
                  setSchoolEmailEnding('ucr.edu');
                } else if (e.detail.value == 'UC San Diego') {
                  setSchoolEmailEnding('ucsd.edu');
                } else if (e.detail.value == 'UCSF') {
                  setSchoolEmailEnding('ucsf.edu');
                } else if (e.detail.value == 'UC Santa Barbara') {
                  setSchoolEmailEnding('ucsb.edu');
                } else if (e.detail.value == 'UC Santa Cruz') {
                  setSchoolEmailEnding('ucsc.edu');
                }
              }}
            >
              <IonSelectOption value="Cal Poly Humboldt">Cal Poly Humboldt</IonSelectOption>
              <IonSelectOption value="UC Berkeley">UC Berkeley</IonSelectOption>
              <IonSelectOption value="UC Davis">UC Davis</IonSelectOption>
              <IonSelectOption value="UC Irvine">UC Irvine</IonSelectOption>
              <IonSelectOption value="UCLA">UCLA</IonSelectOption>
              <IonSelectOption value="UC Merced">UC Merced</IonSelectOption>
              <IonSelectOption value="UC Riverside">UC Riverside</IonSelectOption>
              <IonSelectOption value="UC San Diego">UC San Diego</IonSelectOption>
              <IonSelectOption value="UCSF">UCSF</IonSelectOption>
              <IonSelectOption value="UC Santa Barbara">UC Santa Barbara</IonSelectOption>
              <IonSelectOption value="UC Santa Cruz">UC Santa Cruz</IonSelectOption>
              <IonSelectOption disabled={true} value="More schools to come!...">More schools to come!...</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem class="ion-item-style">
            <IonLabel position="stacked">Username</IonLabel>
            <IonInput
              maxlength={15}
              clearInput={true}
              value={userNameSignUp}
              type="text"
              placeholder="userName1234"
              id="userNameSignUp"
              onIonChange={(e: any) => { handleUsernameInput(e) }}
            ></IonInput>
          </IonItem>
          <IonItem class="ion-item-style">
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput
              value={passwordSignUp}
              clearOnEdit={false}
              type="password"
              placeholder="••••••••"
              id="passwordSignUp"
              onIonChange={(e: any) => setPasswordSignUp(e.detail.value)}
            ></IonInput>
          </IonItem>
          <IonItem class="ion-item-style">
            <IonLabel position="stacked">Enter password again</IonLabel>
            <IonInput
              value={passwordSignUpCopy}
              clearOnEdit={false}
              type="password"
              placeholder="••••••••"
              id="passwordSignUpCopy"
              onIonChange={(e: any) => setPasswordSignUpCopy(e.detail.value)}
            ></IonInput>
          </IonItem>
          <br />
          <IonButton
            onClick={register}
            color="transparent"
            mode="ios"
            shape="round"
            fill="outline"
            expand="block"
            id="signUpButton"
          >
            Sign Up
          </IonButton>
          <p className="sign-in-sign-up-list">
            {" "}
            See credentials requirements{" "}
            <Link to="#" onClick={openPasswordRequirements}>
              here
            </Link>{" "}
          </p>
          <p className="sign-in-sign-up-list">
            {" "}
            or <Link to="/landing-page">sign in</Link> to an exising account
          </p>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default React.memo(Register);
