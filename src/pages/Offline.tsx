import { useToast } from "@agney/ir-toast";
import { IonContent, IonHeader, IonItem, IonPage } from "@ionic/react";
import React from "react";


const Offline = () => {

  const Toast = useToast();

  Toast.error("Check your internet connection and try again");

  return (
    <IonPage>
      <IonContent scrollEvents>
        <IonHeader>OFFLINE</IonHeader>

        <IonItem>OFFLINE</IonItem>
        <IonItem>OFFLINE</IonItem>

        <IonItem>OFFLINE</IonItem>

      </IonContent>
    </IonPage>
  );
}

export default Offline;