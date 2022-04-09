import { IonHeader, IonLoading, IonContent } from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '../fbconfig'
import Header from './Header'
import '../App.css';
import { useHistory } from 'react-router';

function Workshops() {
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const history = useHistory();
  const fetchUserName = async () => {
    try {
      // const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      // const doc = await getDocs(q);
      // const data = doc.docs[0].data();
      // setName(data.name);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };
  useEffect(() => {
    setBusy(true);
    if(!user) {
        history.replace("/landing-page");
    }
    else
    {
        setBusy(false);
    }
    fetchUserName();
  }, [user, loading]);
  return (
    <React.Fragment>
      <IonContent>
        <IonHeader class="ion-no-border" style={{padding: "3vh"}}>
          <Header />
        </IonHeader> 
        <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>
        <p> TAB 2 = WORKSHOPS </p>
      </IonContent>
    </React.Fragment>
  );
}

export default React.memo(Workshops);
