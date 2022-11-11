import React from "react";
import { useEffect, useState } from "react";
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonPage } from "@ionic/react";

import { useSelector } from "react-redux"
import { Link } from "react-router-dom";
import { useToast } from "@agney/ir-toast";

import Header from "./Header";
import { timeout } from "../components/functions";
import { sendPasswordReset } from "../fbconfig";
import { useTabsContext } from "../my-context";

const ForgotPassword = () => {
  const Toast = useToast();
  const tabs = useTabsContext();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);

  const [email, setEmail] = useState<string>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    tabs.setShowTabs(false);
  })

  const handleResetPassword = () => {
    setButtonDisabled(true);
    if(email.trim().length <= 0) {
      Toast.error("Enter an email");
      setButtonDisabled(false);
      return;
    }
    sendPasswordReset(email).then((res) => {
      if(res) {
        Toast.success("Email sent! (Check your spam folder)");
        setEmail("");
        timeout(1500).then(() => {
          setButtonDisabled(false);
        });
      } else {
        Toast.error("Email not found, try again");
        setButtonDisabled(false);
      }
    })
  };

  return (
    <IonPage>
      <IonContent>

        <IonHeader class="ion-no-border" style={{ padding: "5vh" }}>
          <Header darkMode={darkModeToggled} schoolName="" zoom={1.2}/>
          <p style={{ textAlign: "center", fontSize: "1.25em" }}>Forgot Password</p>
        </IonHeader>

        <IonList inset={true} mode='ios' className='sign-in-sign-up-list'>
          <IonItem mode='ios' >
            <IonInput clearInput={true} color="transparent" mode='ios' value={email} type="email" placeholder="Email" id="emailSignIn" debounce={250} onIonChange={(e: any) => { setEmail(e.detail.value); }} ></IonInput>
          </IonItem>
          <br />
          <IonButton color="transparent" mode='ios' disabled={buttonDisabled} onClick={() => {handleResetPassword(); }} shape="round" fill="outline" expand="block" id="signInButton" >Send Password Reset</IonButton>
          <br />
          <br />
          <p className="sign-in-sign-up-list">
            {" "}
            or <Link to="/landing-page">sign in</Link> to an exising account
          </p>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default React.memo(ForgotPassword);