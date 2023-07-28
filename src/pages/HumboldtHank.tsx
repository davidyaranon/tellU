import { useCallback, useEffect, useRef, useState } from "react";
import {
  IonContent, IonHeader, IonToolbar, IonIcon, IonTextarea, IonPage, IonFab,
  IonRow, IonFabButton, IonProgressBar, IonAvatar, IonLabel, useIonToast
} from "@ionic/react";
import { arrowUpOutline } from "ionicons/icons";
import { Preferences } from "@capacitor/preferences";
import { KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";

import FadeIn from "react-fade-in/lib/FadeIn";
import { useToast } from "@agney/ir-toast";

import { useContext } from "../my-context"
import { timeout } from "../helpers/timeout";
import { testOpenAi, updateAchievements } from "../fbConfig";

import Hank from '../images/hank_blue_crop.png';
import Blaze from '../images/bronco.png';
import Blitz from '../images/blitz.png';
import { useHistory } from "react-router";


const aiName: Record<string, string> = {
  "Cal Poly Humboldt": "Hank",
  "UC Davis": "Blaze the Bronco",
  "UC Berkeley": "Blitz the Bruin",
  "": ""
};

const aiImage: Record<string, string> = {
  "Cal Poly Humboldt": Hank,
  "UC Davis": Blaze,
  "UC Berkeley": Blitz,
  "": ""
};

export const HumboldtHank = () => {

  const Toast = useToast();
  const context = useContext();
  const [present] = useIonToast();
  const history = useHistory();

  const [answers, setAnswers] = useState<any[]>([]);
  const [firstTime, setFirstTime] = useState<boolean>(true);
  const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
  const textRef = useRef<HTMLIonTextareaElement>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [kbHeight, setKbHeight] = useState<number>(0);
  const contentRef = useRef<HTMLIonContentElement>(null);

  const presentAchievement = async (achievement: string): Promise<void> => {
    const achStr = achievement.replace(/\s+/g, '');
    await Preferences.set({ "key": achStr, value: "true" });
    present({
      message: 'You just unlocked the ' + achievement + ' achievement!',
      duration: 3500,
      position: 'top',
      buttons: [
        {
          text: 'Open',
          role: 'info',
          handler: () => { history.push('/achievements'); }
        },
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => { }
        }
      ],
      cssClass: 'toast-options',
    });
  }


  /**
   * Loads school from local storage (Preferences API)
  */
  const setSchool = useCallback(async () => {
    const school = await Preferences.get({ key: 'school' });
    if (school && school.value) {
      setSchoolName(school.value);
      const answerArr = ['I\'m ' + aiName[school.value] + ' your AI friend. Ask me anything!'];
      setAnswers(answerArr);
    } else {
      const toast = Toast.create({ message: 'Something went wrong', duration: 2000, color: 'toast-error' });
      toast.present();
    }
    const aiChatAchievement = await Preferences.get({ key: "TechWhisperer" });
    if (aiChatAchievement && aiChatAchievement.value === "true") {
      setFirstTime(false);
    }
  }, []);

  useEffect(() => {
    setSchool();
  }, []);


  useEffect(() => {
    context.setShowTabs(true);
  }, []);



  return (
    <IonPage>
      <IonHeader collapse="fade" className='ion-no-border'>
        <IonToolbar mode='ios' color={context.darkMode ? 'tab-bar-background' : 'tab-bar-background-light'} className='ion-no-border'>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: "1vh" }} />
            <IonAvatar>
              <img src={aiImage[schoolName]} />
            </IonAvatar>
            <IonLabel color={context.darkMode ? "" : "black"}>{aiName[schoolName]}</IonLabel>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" ref={contentRef}>
        <IonFab style={context.darkMode ? { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" }
          : { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed"
          className={context.darkMode ? "text-area-dark" : "text-area-light"} vertical="bottom" edge>
          {loadingAnswer &&
            <IonProgressBar color='primary' type="indeterminate" />
          }
          <IonTextarea
            mode="ios"
            rows={3}
            style={{ width: "69vw", marginLeft: "2.5vw" }}
            spellcheck={true}
            maxlength={300}
            ref={textRef}
            disabled={loadingAnswer}
            placeholder={"Ask me anything!"}
            id="commentModal"
            color={context.darkMode ? "" : 'black'}
            className={context.darkMode ? "text-area-dark" : "text-area-light"}
          />
          <IonFab horizontal="end" vertical="top">
            <IonRow>
              <IonFabButton disabled={loadingAnswer} size="small" color={'primary'}
                onClick={async () => {
                  contentRef && contentRef.current && contentRef.current.scrollToBottom(500);
                  if (!textRef || !textRef.current || !textRef.current.value || !schoolName) return;
                  setLoadingAnswer(true);
                  setAnswers(prevAnswers => [...prevAnswers, textRef.current?.value || '']);

                  // Create a promise that resolves after 15 seconds
                  const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                      reject(new Error('The function took too long to respond.'));
                    }, 15000);
                  });

                  try {
                    const ans = await Promise.race([testOpenAi(schoolName, textRef.current.value), timeoutPromise]);

                    if (!ans) {
                      console.log('something went wrong with AI, try again');
                      const toast = Toast.create({ message: 'Something went wrong!' + aiName[schoolName] + ' must be sleeping...', duration: 2000, color: 'toast-error' });
                      toast.present();
                      setLoadingAnswer(false);
                      return;
                    }

                    if (firstTime) {
                      await updateAchievements('Tech Whisperer');
                      await presentAchievement('Tech Whisperer');
                      setFirstTime(false);
                    }

                    setAnswers(prev => {
                      let temp = [...prev];
                      let temp2 = temp.splice(temp.length - 4, 4);
                      return [...temp2, ans];
                    });

                    setLoadingAnswer(false);
                    textRef.current.value = '';
                    await timeout(500);
                    contentRef && contentRef.current && contentRef.current.scrollToBottom(500);
                  } catch (error) {
                    console.error(error);
                    const toast = Toast.create({ message: 'Something went wrong!' + aiName[schoolName] + ' must be sleeping...', duration: 2000, color: 'toast-error' });
                    toast.present();
                    setLoadingAnswer(false);
                  }
                }}
              >
                <IonIcon icon={arrowUpOutline} color={!context.darkMode ? "light" : ""} size="small" mode="ios" />
              </IonFabButton>
            </IonRow>
          </IonFab>
        </IonFab>

        {answers.map((ans: string | null, index) => {
          if (index % 2 == 1) {
            let messageClass: string = 'sent-humboldt-hank';
            return (
              <FadeIn key={index.toString() + ans?.slice(0, 10)} className={`message ${messageClass}`}>
                <>
                  <p
                    onClick={(e: any) => { }
                    } >{ans}
                  </p>
                </>
              </FadeIn>
            )
          } else {
            let messageClass: string = 'received-hank';
            return (
              <FadeIn key={index.toString() + ans?.slice(0, 10)} className={`message ${messageClass}`}>
                <>
                  <p
                    onClick={(e: any) => { }
                    } >{ans}
                  </p>
                </>
              </FadeIn>
            )
          }
        })}
        <div style={{ height: "25vh" }} />
      </IonContent>
    </IonPage >
  );

};
