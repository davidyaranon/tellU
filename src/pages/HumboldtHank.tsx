import { Keyboard, KeyboardResize, KeyboardResizeOptions, KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";
import { IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonTextarea, IonPage, IonFab, IonRow, IonCol, IonFabButton, IonImg } from "@ionic/react";
import { arrowUpOutline, banOutline, cameraOutline, closeOutline } from "ionicons/icons";
import { useContext } from "../my-context";

import { testOpenAi } from "../fbConfig";
import { useCallback, useEffect, useRef, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { useToast } from "@agney/ir-toast";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

import Hank from '../images/hank.png';

const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
}

const resizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.None,
}

const defaultResizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.Body,
}


export const HumboldtHank = () => {

  const context = useContext();
  const [answers, setAnswers] = useState<any[]>(['I\'m Hank your AI friend. Ask me anything!']);
  const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
  const textRef = useRef<HTMLIonTextareaElement>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [kbHeight, setKbHeight] = useState<number>(0);
  const Toast = useToast();

  /**
   * Loads school from local storage (Preferences API)
  */
  const setSchool = useCallback(async () => {
    const school = await Preferences.get({ key: 'school' });
    if (school && school.value) {
      setSchoolName(school.value);
    } else {
      const toast = Toast.create({ message: 'Something went wrong', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  }, []);


  useEffect(() => {
    context.setDarkMode(true);
    document.body.classList.toggle("dark");
    context.setDarkMode(true);
    if (Capacitor.getPlatform() === "ios") {
      Keyboard.setStyle(keyStyleOptionsDark);
      StatusBar.setStyle({ style: Style.Dark });
    }
  }, [context]);


  useEffect(() => {
    setSchool();
  }, [])


  useEffect(() => {
    context.setShowTabs(true);
  }, []);

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      Keyboard.setResizeMode(resizeOptions);
      setKbHeight(info.keyboardHeight);
    });

    Keyboard.addListener('keyboardWillHide', () => {
      Keyboard.setResizeMode(defaultResizeOptions);
      setKbHeight(0);
    });
    return () => {
      Keyboard.removeAllListeners();
    };
  }, [])


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <img style={{ width: "90vw", marginLeft: "5vw", marginRight: "5vw" }} src={Hank} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonFab style={context.darkMode ? { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" }
          : { bottom: `${kbHeight}px`, height: "125px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed"
          className={context.darkMode ? "text-area-dark" : "text-area-light"} vertical="bottom" edge>
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
              <IonFabButton disabled={loadingAnswer} size="small" color={'secondary'}
                onClick={async () => {
                  if (!textRef || !textRef.current || !textRef.current.value) return;
                  setLoadingAnswer(true);
                  setAnswers(prevAnswers => [...prevAnswers, textRef.current?.value || '']);
                  const ans: string = await testOpenAi(textRef.current.value);
                  if (!ans || ans.length <= 0) {
                    console.log('something went wrong with AI, try again');
                    setLoadingAnswer(false);
                    return;
                  }
                  setAnswers(prevAnswers => [...prevAnswers, ans]);
                  setLoadingAnswer(false);
                  textRef.current.value = '';
                }}
              >
                <IonIcon icon={arrowUpOutline} color={!context.darkMode ? "light" : ""} size="small" mode="ios" />
              </IonFabButton>
            </IonRow>
          </IonFab>
        </IonFab>

        {answers.map((ans: string | null, index) => {
          if (index % 2 == 1) {
            let messageClass: string = 'sent-humboldt';
            return (
              <>
                <div key={index.toString() + ans?.slice(0, 10)} className={`message ${messageClass}`}>
                  <>
                    <p
                      onClick={(e: any) => { }
                      } >{ans}
                    </p>
                  </>
                </div>
              </>
            )
          } else {
            let messageClass: string = 'received';
            return (
              <div key={index.toString() + ans?.slice(0, 10)} className={`message ${messageClass}`}>
                <>
                  <p
                    onClick={(e: any) => { }
                    } >{ans}
                  </p>
                </>
              </div>
            )
          }
        })}
        <div style={{ height: "20vh" }} />
      </IonContent>
    </IonPage >
  );

};