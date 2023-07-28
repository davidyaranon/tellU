import { Preferences } from "@capacitor/preferences";
import { IonContent, IonItem, IonList, IonNote, IonPage, IonThumbnail } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { Toolbar } from "../components/Shared/Toolbar";
import { AchievementIcons, AchievementDescriptions, listOfAchievements } from "../helpers/achievements-config";
import { useContext } from "../my-context";

export const Achievements = () => {

  const context = useContext();

  const [achievements, setAchievements] = useState<string[]>([]);

  const getDescription = (achievement: string): string => {
    if (achievements.includes(achievement)) {
      return AchievementDescriptions[achievement];
    }
    return "Keep using tellU to unlock this achievement!";
  };

  const getIcon = (achievement: string): string => {
    if (achievements.includes(achievement)) {
      return AchievementIcons[achievement];
    }
    return AchievementIcons['Hidden'];
  };

  const loadAchievements = useCallback(async () => {
    const keysResult = await Preferences.keys();
    const listOfKeys: string[] = keysResult.keys;
    let tempAchievements: string[] = [];
    for (let i = 0; i < listOfAchievements.length; ++i) {
      const achStr: string = listOfAchievements[i].replace(/\s+/g, '');
      if (listOfKeys.includes(achStr)) {
        tempAchievements.push(listOfAchievements[i]);
      }
    }
    setAchievements(tempAchievements);
  }, []);

  useEffect(() => {
    loadAchievements();
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
          {listOfAchievements.map((achievement: string, index: number) => (
            <IonItem style={context.darkMode ? { '--background': '#0D1117' } : { '--background': '#FFFFFF' }} lines='full' key={achievement + index}>
              <IonThumbnail slot="end">
                <img alt={achievement} src={getIcon(achievement)} />
              </IonThumbnail>
              <p>{achievement} <br /> <span style={{ fontSize: ".75em", color: "var(--ion-color-medium)" }}>{getDescription(achievement)}</span></p>
            </IonItem>
          ))}
        </IonList>

      </IonContent>
    </IonPage>
  )
};
