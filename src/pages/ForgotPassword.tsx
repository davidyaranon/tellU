import { useEffect, useState } from "react";
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage } from "@ionic/react";
import { KeyboardResizeOptions, Keyboard, KeyboardResize } from "@capacitor/keyboard";

import { useToast } from "@agney/ir-toast";
import Header from "../components/Shared/Header";
import { timeout } from "../helpers/timeout";
import { sendPasswordReset } from "../fbConfig";
import { useContext } from "../my-context";
import { Toolbar } from "../components/Shared/Toolbar";

// global variables
const defaultResizeOptions: KeyboardResizeOptions = { mode: KeyboardResize.Body }

const ForgotPassword = () => {

  // hooks
  const Toast = useToast();
  const context = useContext();

  // state variables
  const [email, setEmail] = useState<string | number>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  /**
   * @description handles the reset password button click
   */
  const handleResetPassword = () => {
    setButtonDisabled(true);
    if(typeof email != 'string') {
      const toast = Toast.create({ message: 'Enter an email', duration: 2000, color: 'toast-error' });
      toast.present();
      setButtonDisabled(false);
      return;
    }
    if (email.trim().length <= 0) {
      const toast = Toast.create({ message: 'Enter an email', duration: 2000, color: 'toast-error' });
      toast.present();
      setButtonDisabled(false);
      return;
    }
    sendPasswordReset(email).then((res) => {
      if (res) {
        const toast = Toast.create({ message: 'Email sent! (Check your spam folder)', duration: 2000, color: 'toast-success' });
        toast.present();
        toast.dismiss();
        setEmail("");
        timeout(1500).then(() => {
          setButtonDisabled(false);
        });
      } else {
        const toast = Toast.create({ message: 'Email not found, try again', duration: 2000, color: 'toast-error' });
        toast.present();
        setButtonDisabled(false);
      }
    })
  };

  /**
   * Keyboard event listener useEffect
   */
  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      Keyboard.setResizeMode(defaultResizeOptions);
    });
    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);

  return (
    <IonPage>
      <Toolbar color="primary" text="Sign In" />

      <IonContent scrollY={false}>

        <IonHeader style={{ padding: "5vh" }}>
          <Header darkMode={context.darkMode} schoolName="" zoom={1.2} />
          <p style={{ textAlign: "center", fontSize: "1.5em", fontFamily: 'sans-serif' }}>Forgot Password</p>
        </IonHeader>

        <IonLabel color="primary" className="login-label">Email</IonLabel>
        <IonItem className='login-input'>
          <IonInput type="email" value={email} placeholder="Email" onIonChange={(e) => { setEmail(e.detail.value!); }} />
        </IonItem>
        <br />
        <IonButton className="login-button" disabled={buttonDisabled} onClick={() => { handleResetPassword(); }} fill="clear" expand="block" id="signInButton" >Send Password Reset</IonButton>

      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;