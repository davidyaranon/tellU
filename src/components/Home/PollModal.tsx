/* React + Ionic */
import { useState } from "react";
import {
  IonModal, IonContent, IonToolbar, IonButtons, IonButton,
  IonInput, IonList, IonItem, IonIcon
} from '@ionic/react';
import { Keyboard } from "@capacitor/keyboard";
import { closeOutline } from "ionicons/icons";

/* Firebase */
import { promiseTimeout, submitPollNew } from "../../fbConfig";

/* Other imports */
import { useToast } from "@agney/ir-toast";


interface PollAnswer {
  text: string,
};

export const PollModal = (props: any) => {
  const schoolName = props.schoolName;
  const setShowPollModal = props.setShowPollModal;
  const isOpen = props.isOpen;
  const user = props.user;
  const setShowProgressBar = props.setShowProgressBar;

  const Toast = useToast();
  const [pollText, setPollText] = useState<string>("");
  const [pollOptions, setPollOptions] =
    useState<PollAnswer[]>([
      { text: "", },
      { text: "", },
      { text: "", },
    ]);

  const handlePollTextChange = (e: any) => {
    let currComment = e.detail.value;
    setPollText(currComment);
  };

  const handleChangePollOptions = (index: number, e: any) => {
    let option = e.detail.value;
    let tempOptionsArr: PollAnswer[] = [...pollOptions];
    tempOptionsArr[index].text = option;
    setPollOptions(tempOptionsArr);
  }

  const addPollAnswer = () => {
    let tempPollArr: PollAnswer[] = [...pollOptions];
    tempPollArr.push({ text: "" });
    setPollOptions(tempPollArr);
  }

  const removePollAnswer = () => {
    let tempPollArr: PollAnswer[] = [...pollOptions];
    tempPollArr.pop();
    setPollOptions(tempPollArr);
  }

  const submitPoll = async () => {
    if (!user) {
      const toast = Toast.create({ message: 'Something went wrong with authentication, try reloading app', duration: 2000, color: 'toast-error' });
      toast.present();
      return;
    }
    if (pollText.trim().length <= 0) {
      const toast = Toast.create({ message: 'Enter a poll question!', duration: 2000, color: 'toast-error' });
      toast.present();
      return;
    }
    for (let i = 0; i < pollOptions.length; ++i) {
      if (pollOptions[i].text.trim().length <= 0) {
        const toast = Toast.create({ message: "Enter text for option #" + (i + 1).toString(), duration: 2000, color: 'toast-error' });
        toast.present();
        return;
      }
    }
    if (!schoolName) {
      const toast = Toast.create({ message: 'Something went wrong when retreiving school name', duration: 2000, color: 'toast-error' });
      toast.present();
      return;
    }
    setShowProgressBar(true);
    Keyboard.hide().then(() => {
      setPollText('');
      setTimeout(() => setShowPollModal(false), 100);
    });
    const pollSubmitted = promiseTimeout(10000, submitPollNew(pollText, pollOptions, schoolName, user.displayName, user.uid));
    pollSubmitted.then((res) => {
      if (!res) {
        Toast.error("Something went wrong when submitting poll, please try again");
      } else {
        const toast = Toast.create({ message: 'Poll submitted!', duration: 2000, color: 'toast-success' });
        toast.present();
        toast.dismiss();
      }
      setShowProgressBar(false);
    });
    pollSubmitted.catch((err) => {
      const toast = Toast.create({ message: 'Check your internet connection', duration: 2000, color: 'toast-error' });
      toast.present();
      setShowProgressBar(false);
    });
  }

  return (
    <IonModal backdropDismiss={false} isOpen={isOpen} handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
      <IonContent>
        <div>
          <div style={{ width: "100%" }}>
            <IonToolbar mode="ios">
              <IonButtons>
                <IonButton
                  color={"primary"}
                  onClick={() => {
                    Keyboard.hide().then(() => {
                      setTimeout(() => setShowPollModal(false), 100);
                    }).catch((err) => {
                      setTimeout(() => setShowPollModal(false), 100);
                    });
                    setPollText("");
                  }}
                >
                  <IonIcon icon={closeOutline}></IonIcon>
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton color="light" onClick={submitPoll} expand='block' className={"post-button"} fill="clear">Post</IonButton>
              </IonButtons>
            </IonToolbar>
          </div>

          <br />

          <IonInput
            autoCorrect="on"
            aria-label=""
            type="text"
            style={{ width: "90vw", left: "5vw", fontWeight: "bold" }}
            maxlength={100}
            value={pollText}
            placeholder="Ask a question..."
            id="pollQuestion"
            onIonChange={(e: any) => {
              handlePollTextChange(e);
            }}
          ></IonInput>
          {pollOptions && pollOptions.length > 0 ? (
            <IonList mode="md" inset={true} lines="none">
              {pollOptions?.map((option, index) => {
                return (
                  <IonItem key={index}><p style={{ alignSelf: "center" }} slot="start">{(index + 1).toString() + ". "}</p>
                    <IonInput aria-label="" maxlength={50} value={isOpen ? option.text : ""} onIonChange={(e: any) => { handleChangePollOptions(index, e) }} />
                  </IonItem>
                )
              })}
            </IonList>
          ) : (null)}
          <div style={{ textAlign: "center", }}>
            <IonButton color="medium" fill="clear" disabled={pollOptions.length >= 6} onClick={addPollAnswer} mode="md">Add Option</IonButton>
            <IonButton fill="clear" color="toast-error" disabled={pollOptions.length <= 2} onClick={removePollAnswer} mode="md">Remove Option</IonButton>
          </div>
          <br />
          <div style={{ textAlign: "center", }}>
            {/* <IonCardSubtitle>*Polls are up for 4 days</IonCardSubtitle> */}
          </div>
        </div>
      </IonContent>
    </IonModal>
  )
}
