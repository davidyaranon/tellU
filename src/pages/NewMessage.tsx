import { IonContent, IonHeader, IonRouterLink, IonLoading, IonActionSheet, IonButton, IonIcon, IonRippleEffect, IonFab, IonFabButton } from '@ionic/react';
import React from 'react';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import auth from '../fbconfig';
import Header from './Header'
import '../App.css';
import { add, settings, share, person, arrowForwardCircle, arrowBackCircle, arrowUpCircle, logoVimeo, logoFacebook, logoInstagram, logoTwitter } from 'ionicons/icons';


function NewMessage() {
    const [busy, setBusy] = useState<boolean>(false);
    const [user, loading, error] = useAuthState(auth);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const ionHeaderStyle = {
      textAlign: 'center',
      padding: "5vh",
    };
    function toggleAnimation() {
  
    }
    function actionSheet() {
      setShowActionSheet(true);
    }
    useEffect(() => {
  
    }, [user, loading]);
    return (
      <React.Fragment>
        <IonContent>
          <IonHeader class="ion-no-border" style={ionHeaderStyle}>
            msg page lol
          </IonHeader> 
          
          
          <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>
          <p> SEND A NEW MESSAGE :) </p>

        </IonContent>
      </React.Fragment>
    );
  }

export default NewMessage;