import { IonHeader, IonContent, IonLoading, IonButton, IonInput, IonFab, IonTextarea,
IonTitle, IonToolbar, IonList, IonItem, IonIcon, IonLabel, IonModal, IonToggle, IonText} from '@ionic/react';
import React, { useRef, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logout, addMessage, db } from '../fbconfig'
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, getDocs,  query, orderBy, limit, doc, getDoc, updateDoc, } from 'firebase/firestore';
import Header, { ionHeaderStyle } from './Header'
import '../App.css';
import { useHistory } from 'react-router';
import { useToast } from "@agney/ir-toast";
import { useSelector } from 'react-redux';
import { moon } from 'ionicons/icons';
import { updateEmail } from "firebase/auth";
import { useDispatch } from "react-redux"
import { setDarkMode} from '../redux/actions';


function User() {
  const Toast = useToast();
  const dispatch = useDispatch();
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [editableUsername, setEditableUsername] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [passwordReAuth, setPasswordReAuth] = useState("");
  const [editClicked, setEditClicked] = useState<boolean>(false);
  const [editUserClicked, setEditUserClicked] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const [credentialsModal, setCredentialsModal] = useState(false);
  const [busy, setBusy] = useState<boolean>(false);
  const history = useHistory();

  const toggleDarkModeHandler = (isChecked : boolean) => {
    document.body.classList.toggle("dark");
    dispatch(setDarkMode(isChecked));
    localStorage.setItem("darkMode", JSON.stringify(isChecked));
  };

  const handleEdit = () => {
    inputRef.current?.setFocus();
    setEditClicked(true);
  }

  const handleUserEdit = () => {
    inputRef.current?.setFocus();
    setEditUserClicked(true);
  }

  const handleChangeEmailString = (e : any) => {
    setEditableEmail(e.detail.value);
  }

  const handleChangeUsernameString = (e : any) => {
    setEditableUsername(e.detail.value);
  }

  const handleX = () => {
    setEditClicked(false);
  }

  const handleUserX = () => {
    setEditUserClicked(false);
  }

  const handleCheckmark = () => {
    if(editableEmail.trim() != email.trim()) {
      promptForCredentials();
    } else {
      Toast.error("No changes made");
    }
    setEditClicked(false);
  }

  const handleUserCheckmark = () => {
    if(editableUsername.trim() != username.trim()) {
      // promptForCredentials();
    } else {
      Toast.error("No changes made");
    }
    setEditUserClicked(false);
  }

  const promptForCredentials = () => {
    setCredentialsModal(true);
  }

  async function handleEmailChange() {
    setBusy(true);
    if(user && user.email) {
      if(user.email == editableEmail) {
        Toast.error("No changes made");
        setBusy(false);
        setCredentialsModal(false);
      } else {
        const credentials = EmailAuthProvider.credential(
          user.email!,
          passwordReAuth
        );
        reauthenticateWithCredential(user, credentials).then(() => {
          updateEmail(user, editableEmail).then(() => {
            if(user && user.uid) {
              const userDataRef = doc(db, "userData", user.uid);
              updateDoc(userDataRef, {
                userEmail: editableEmail
              }).then(() => {
                Toast.success("Updated email");
                setCredentialsModal(false);
                setBusy(false);
              }).catch((err) => {
                Toast.error(err.message.toString());
                setEditableEmail(email);
                setBusy(false);
              });
            } else {
              Toast.error("Updated email but view was unable to be updated");
              setEditableEmail(email);
              setBusy(false);
            }
          }).catch((err) => {
            Toast.error(err.message.toString());
            setEditableEmail(email);
            setBusy(false);
          });
        }).catch((err) => {
          Toast.error(err.message.toString());
          setEditableEmail(email);
          setBusy(false);
        });
      }
    } else {
      Toast.error("Unable to update emiail");
      setEditableEmail(email);
      setBusy(false);
    }
  }

  async function loadLogout() {
    const res = await logout();
    if(res == 'true') {
      Toast.success("Logging out...");
    } else {
      Toast.error(res);
    }
  }
  useEffect(() => {
    setBusy(true);
    if(!user) {
        history.replace("/landing-page");
    } else {
        if(!loading && user) {
          setEmail(user.email!);
          setEditableEmail(user.email!);
          setUsername(user.displayName!);
          setEditableUsername(user.displayName!);
          setBusy(false);
        }
    }
  }, [user]);
  if(loading) {
    return (
      <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>
    )
  }
  return (
    <React.Fragment>
      <IonContent>
        <IonHeader class="ion-no-border" style={ionHeaderStyle}>
          <Header />
          <IonTitle class='ion-title'> Hello, {username} </IonTitle>
        </IonHeader> 
        <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>

        <IonModal backdropDismiss={false} isOpen={credentialsModal}>
        <div className='ion-modal'>
          <IonHeader mode='ios'> 
            <IonTitle color='secondary' class='ion-title'> <div>Re-Authentication</div> </IonTitle>
          </IonHeader>
          <div><br></br></div>
          <IonList inset={true} mode='ios' className='sign-in-sign-up-list'>
            <IonItem mode='ios' class="ion-item-style" >
                <IonInput color="transparent" mode='ios' clearOnEdit={false} value={passwordReAuth} type="password" placeholder="Enter your password again..." id="passwordSignIn" onIonChange={(e: any) => setPasswordReAuth(e.detail.value)} ></IonInput>
            </IonItem>
            <br />
            <IonButton color="danger" mode='ios' onClick={() => {setCredentialsModal(false); setEditableEmail(email); }} shape="round" fill="outline"  id="cancelButton" >Cancel</IonButton>
            <IonButton color="transparent" mode='ios' onClick={handleEmailChange} shape="round" fill="outline"  id="signInButton" >Sign In</IonButton>
            <br/>
            <br/>
            </IonList>
           </div>
        </IonModal>

        <IonList mode='ios' inset={true}>
          <IonItem mode='ios' >
            <IonLabel mode='ios' >
              <IonText color='medium'>
                <p> Email </p>
              </IonText>
              <IonInput ref={inputRef} readonly={!editClicked} value={editableEmail} onIonChange={(e) => {handleChangeEmailString(e)}}></IonInput>
            </IonLabel>
            {editClicked? (
              <div >
                <IonButton color="danger" slot="end" onClick={handleX}> X </IonButton>
                <IonButton color="success" slot="end" onClick={handleCheckmark}> &#10003; </IonButton>
              </div>

            ) : (
              <IonButton disabled={editClicked} onClick={handleEdit} color='medium' slot='end'> Edit </IonButton>
            )}
          </IonItem>
          <IonItem mode='ios' >
            <IonLabel mode='ios' >
              <IonText color='medium'>
                <p> Username </p>
              </IonText>
              <IonInput ref={inputRef} readonly={!editUserClicked} value={editableUsername} onIonChange={(e) => {handleChangeUsernameString(e)}}></IonInput>
            </IonLabel>
            {editUserClicked? (
              <div >
                <IonButton color="danger" slot="end" onClick={handleUserX}> X </IonButton>
                <IonButton color="success" slot="end" onClick={handleUserCheckmark}> &#10003; </IonButton>
              </div>

            ) : (
              <IonButton disabled={editUserClicked} onClick={handleUserEdit} color='medium' slot='end'> Edit </IonButton>
            )}
          </IonItem>
          <IonItem mode='ios' >
            <p> Dark mode </p>
            <IonIcon color='medium' icon={moon} slot='end'/>
            <IonToggle
              slot="end"
              name="darkMode"
              checked={darkModeToggled}
              onIonChange={ e => toggleDarkModeHandler(e.detail.checked)}
            />
          </IonItem>
        </IonList>
        <IonButton onClick={loadLogout} color="danger" mode='ios' shape="round" fill="outline" expand='full' id="logout" >Logout</IonButton>
        <IonButton color="danger" mode='ios' shape="round" fill="outline" expand='full'  id="deleteAccount" >Delete Account</IonButton>
      </IonContent>
    </React.Fragment>

  );
}

export default React.memo(User);
