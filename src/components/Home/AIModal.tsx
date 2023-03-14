import { Keyboard } from "@capacitor/keyboard";
import { IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonTextarea } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { useContext } from "../../my-context";

import { testOpenAi } from "../../fbConfig";
import { useRef, useState } from "react";

export const AIModal = (props: any) => {

  const schoolName = props.schoolName;
  const isOpen = props.isOpen;
  const setShowAIModal = props.setShowAIModal;

  const context = useContext();
  const [answers, setAnswers] = useState<string[]>(['Ask me anything!']);
  const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
  const textRef = useRef<HTMLIonTextareaElement>(null);

  return (
    <IonModal backdropDismiss={false} isOpen={isOpen} swipeToClose={false} handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
      <IonContent>
        <div style={{ width: "100%" }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Humboldt Hank</IonTitle>
              <IonButtons style={{ marginLeft: "-2.5%" }}>
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
                  onClick={() => {
                    Keyboard.hide().then(() => {
                      setTimeout(() => setShowAIModal(false), 100);
                    }).catch((err) => {
                      setTimeout(() => setShowAIModal(false), 100);
                    });
                  }}
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
        </div>

        <IonTextarea ref={textRef} />

        <IonButton disabled={loadingAnswer} onClick={async () => {
          if (!textRef || !textRef.current || !textRef.current.value) return;
          setLoadingAnswer(true);
          const ans: string = await testOpenAi(textRef.current.value);
          if (!ans || ans.length <= 0) {
            console.log('something went wrong with AI, try again');
            setLoadingAnswer(false);
            return;
          }
          setAnswers([...answers, ans]);
          setLoadingAnswer(false);
        }}
        >
          Test OpenAI
        </IonButton>

        {answers.map((ans, index) => {
          return (
            <div key={index}>
              <p>{ans}</p>
            </div>
          )
        })}


      </IonContent>
    </IonModal>
  );

};