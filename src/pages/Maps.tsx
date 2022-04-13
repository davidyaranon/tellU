import { IonHeader, IonContent, IonLoading } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '../fbconfig'
import Header, { ionHeaderStyle } from './Header'
import '../App.css';
import { useHistory } from 'react-router';

function Maps() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<boolean>(false);
  const history = useHistory();
  useEffect(() => {
    setBusy(true);
    if(!user) {
        history.replace("/landing-page");
    }
    else
    {
        setBusy(false);
    }
  }, [user, loading]);
  return (
    <React.Fragment>
      <IonContent>
        <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>
        <IonHeader class="ion-no-border" style={ionHeaderStyle}>
          <Header />
        </IonHeader>
          <p> TAB 3 = MAPS </p>
      </IonContent>
   </React.Fragment>
  );
}

export default React.memo(Maps);
