import { IonContent, IonHeader, IonTitle } from "@ionic/react";
import React, { useEffect } from "react";
import UIContext from "../my-context";
import { ionHeaderStyle } from "./Header";


export const PrivacyPolicy = () => {
  const { setShowTabs } = React.useContext(UIContext);

  useEffect(() => {
    setShowTabs(false);
  }, [])

  return (
    <React.Fragment>
      <IonContent>
        
          <IonTitle>
            Privacy Policy
          </IonTitle>
        
      </IonContent>
    </React.Fragment>
  )
}