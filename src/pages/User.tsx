import { IonHeader, IonContent, IonLoading, IonButton, IonInput, IonTitle } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logout, addMessage, } from '../fbconfig'
import Header from './Header'
import '../App.css';
import { useHistory } from 'react-router';
import { useToast } from "@agney/ir-toast";
import { useSelector } from 'react-redux';

function User() {
  const Toast = useToast();
  const username = useSelector( (state: any) => state.user.username);
  const email = useSelector( (state: any) => state.user.email )
  const [message, setMessage] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const history = useHistory();

  async function loadLogout() {
    const res = await logout();
    if(res == 'true') {
      Toast.success("Logging out...");
    }
    else {
      Toast.error(res);
    }
  }
  useEffect(() => {
    setBusy(true);
    if(!user) {
        history.replace("/landing-page");
    }
    else
    {
        setBusy(false);
    }
  },);
  return (
    <React.Fragment>
      <IonContent>
      <IonHeader class="ion-no-border" style={{padding: "3vh"}}>
        <Header />
        <IonTitle class='ion-title'> Hello, {username} </IonTitle>
      </IonHeader> 
        <br/>
      <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>
        <br/>
        <p> Email: {email} </p>
        <p> or </p>
        <IonButton onClick={loadLogout} color="transparent" mode='ios' shape="round" fill="outline" expand="block"  id="signUpButton" >Logout</IonButton>
      </IonContent>
    </React.Fragment>

  );
}

export default React.memo(User);
