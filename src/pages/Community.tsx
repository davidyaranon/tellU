import { IonContent, IonHeader, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonCardTitle, IonCard, IonSlides, IonSlide,
  IonInfiniteScrollContent,  IonModal, IonImg, IonList, IonItem, IonLabel, IonTextarea, IonLoading, IonText, IonAvatar,
  IonInput, IonActionSheet, IonButton, IonIcon, IonRippleEffect, IonFab, IonFabButton, IonToolbar, IonTitle, IonButtons, IonSearchbar } 
from '@ionic/react';
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '../fbconfig'
import Header, { ionHeaderStyle } from './Header'
import '../App.css';
import { useHistory } from 'react-router';

function Community() {
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
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
        <IonHeader class="ion-no-border" style={ionHeaderStyle}>
            <IonToolbar style={{marginTop: "5%"}} mode='ios'>
            <IonSearchbar mode='ios' placeholder='Search for posts/users' inputMode='search' value={searchText} onIonChange={e => setSearchText(e.detail.value!)}></IonSearchbar>
            </IonToolbar>
          </IonHeader>
        <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>



      </IonContent>
    </React.Fragment>
  );
}

export default React.memo(Community);
