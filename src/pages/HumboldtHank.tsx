import { useCallback, useEffect, useRef, useState } from "react";
import {
  IonContent, IonHeader, IonToolbar, IonIcon, IonTextarea, IonPage, IonFab,
  IonRow, IonFabButton, useIonViewWillEnter, IonProgressBar, IonAvatar, IonLabel
} from "@ionic/react";
import { arrowUpOutline } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Preferences } from "@capacitor/preferences";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard, KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";
import { Image as CapacitorImage, PhotoViewer as CapacitorPhotoViewer } from '@capacitor-community/photoviewer';

import FadeIn from "react-fade-in/lib/FadeIn";
import { useToast } from "@agney/ir-toast";

import { useContext } from "../my-context"
import { timeout } from "../helpers/timeout";
import { testOpenAi } from "../fbConfig";

import Hank from '../images/hank_blue_crop.png';
import Blaze from '../images/bronco.png';
import Blitz from '../images/blitz.png';

const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
};

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

  const [answers, setAnswers] = useState<any[]>([]);
  const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
  const textRef = useRef<HTMLIonTextareaElement>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [kbHeight, setKbHeight] = useState<number>(0);
  const contentRef = useRef<HTMLIonContentElement>(null);

  /**
   * @description opens the 'contact photo' image using Capacitor
   */
  const openImage = () => {
    // const img: CapacitorImage = {
    //   url: aiImage[schoolName],
    //   title: aiName[schoolName]
    // };
    // CapacitorPhotoViewer.show({
    //   images: [img],
    //   mode: 'one',
    //   options: {
    //     title: true
    //   }
    // });
  };

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
  }, []);

  /**
  * Sets the status bar to dark mode on iOS
  */
  useIonViewWillEnter(() => {
    if (Capacitor.getPlatform() === 'ios')
      StatusBar.setStyle({ style: Style.Dark });
  }, []);


  useEffect(() => {
    context.setDarkMode(true);
    document.body.classList.toggle("dark");
    context.setDarkMode(true);
    if (Capacitor.getPlatform() === "ios") {
      Keyboard.setStyle(keyStyleOptionsDark);
    }
  }, [context]);


  useEffect(() => {
    setSchool();
  }, []);


  useEffect(() => {
    context.setShowTabs(true);
  }, []);


  return (
    <IonPage>
      <IonHeader collapse="fade" className='ion-no-border'>
        <IonToolbar mode='ios' color='tab-bar-background' className='ion-no-border'>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: "1vh" }} />
            <IonAvatar onClick={openImage}>
              <img src={aiImage[schoolName]} />
            </IonAvatar>
            <IonLabel>{aiName[schoolName]}</IonLabel>
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
            className={"text-area-dark"}
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
