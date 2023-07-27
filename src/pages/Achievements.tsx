import { useToast } from "@agney/ir-toast";
import { IonCardTitle, IonContent, IonItem, IonList, IonNote, IonPage, IonThumbnail } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Toolbar } from "../components/Shared/Toolbar";
import auth, { promiseTimeout, getCurrentUserData } from "../fbConfig";
import { AchievementIcons, AchievementDescriptions, NUM_ACHIEVEMENTS } from "../helpers/achievements-config";
import { useContext } from "../my-context";

export const Achievements = () => {

  const context = useContext();
  const Toast = useToast();
  const [user, loading, error] = useAuthState(auth);

  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    const currentLength = achievements.length;
    if (currentLength < NUM_ACHIEVEMENTS) {
      const padding = Array(NUM_ACHIEVEMENTS - currentLength).fill("Hidden");
      setAchievements([...achievements, ...padding]);
    }
  }, [achievements]);

  const loadNotifications = useCallback(() => {
    if (user && user.uid) {
      const gotUserData = promiseTimeout(7500, getCurrentUserData());
      gotUserData.then((res: any) => {
        if (res) {
          if("achievements" in res && res.achievements.length > 0) {
            setAchievements(res.achievements);
          }
        } else {
          const toast = Toast.create({ message: 'Trouble getting data', duration: 2000, color: 'toast-error' });
          toast.present();
        }
      });
      gotUserData.catch((err) => {
        Toast.error(err);
      });
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [])


  return (
    <IonPage>
      <Toolbar text={'Back'} title="Your Achievements" />
      <IonContent>
        <br />
        <div style={{ textAlign: "center" }}>
          <IonNote style={{ textAlign: "center" }}>Edit your 'about' section in Settings to show off your achievements on your profile</IonNote>
        </div>
        <IonList>
          {achievements.map((achievement: string, index: number) => (
            <IonItem style={context.darkMode ? { '--background': '#0D1117' } : { '--background': '#FFFFFF' }} lines='full' key={achievement + index}>
              <IonThumbnail slot="end">
                <img alt={achievement} src={AchievementIcons[achievement]} />
              </IonThumbnail>
              <p>{achievement} <br /> <span style={{ fontSize: ".75em", color: "var(--ion-color-medium)" }}>{AchievementDescriptions[achievement]}</span></p>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  )
};
