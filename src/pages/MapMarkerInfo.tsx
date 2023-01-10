import { IonPage, IonContent, IonTitle } from "@ionic/react";
import { RouteComponentProps } from "react-router-dom";

import '../App.css';
import { Toolbar } from "../components/Shared/Toolbar";

interface MatchUserPostParams {
  school: string;
  title : string;
  description : string;
}

export const MapMarkerInfo = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const schoolName = match.params.school;
  const title = match.params.title;

  return (
    <IonPage className="ion-page-ios-notch">
      <IonContent>
        <Toolbar schoolName={schoolName} title={title} />

        <IonTitle>{title}</IonTitle>
      </IonContent>
    </IonPage>
  )
};