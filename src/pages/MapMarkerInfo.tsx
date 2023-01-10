import { IonPage, IonContent, IonTitle } from "@ionic/react";
import { useCallback, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";

import '../App.css';
import { Toolbar } from "../components/Shared/Toolbar";
import { getPOIInfo } from "../fbConfig";

interface MatchUserPostParams {
  school: string;
  title : string;
}

export const MapMarkerInfo = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const schoolName = match.params.school;
  const title = match.params.title;

  const getInfo = useCallback(async() => {
    const info = await getPOIInfo(title);

  }, [])

  useEffect(() => {
    getInfo();
  }, [])

  return (
    <IonPage>
      <IonContent>
        <Toolbar schoolName={schoolName} title={title} />

        <IonTitle>{title}</IonTitle>
      </IonContent>
    </IonPage>
  )
};