import { IonContent, IonHeader, IonButton, IonLoading, IonInput, IonItem, IonLabel, IonSpinner, IonList } from '@ionic/react';
import React, { useEffect, useState  } from 'react';
import { auth, logInWithEmailAndPassword, db} from '../fbconfig'
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Header from "./Header"
import '../App.css'
import { useHistory } from 'react-router';
import UIContext from '../my-context'
import { useToast } from "@agney/ir-toast";
import { useDispatch } from "react-redux"
import { setUserState } from '../redux/actions';

const LandingPage: React.FC = () => {
    const dispatch = useDispatch();
    const Toast = useToast();
    const [busy, setBusy] = useState<boolean>(false);
    const { setShowTabs } = React.useContext(UIContext);
    const [emailSignIn, setEmailSignIn] = useState("");
    const [passwordSignIn, setPasswordSignIn] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const history = useHistory();

    async function logIn() {
        setBusy(true);
        if(emailSignIn.trim().length == 0 || passwordSignIn.length == 0) {
            Toast.error("Enter both an email and a password");
        }
        else {
            const res = await logInWithEmailAndPassword(emailSignIn.trim(), passwordSignIn);
            if (!res) {Toast.error("Invalid email/password!");}
            else { 
                let school = "";
                const userRef = doc(db, "userData", res.user.uid);
                getDoc(userRef).then((userSnap) => {
                  if(userSnap.exists()) {
                    school = userSnap.data().school;
                  }
                  dispatch(setUserState(res.user.displayName, res.user.email, false, school));
                  Toast.success("Logged In!"); 
                }).catch((err) => {
                  console.log(err);
                  dispatch(setUserState(res.user.displayName, res.user.email, false, ""));
                });
            }
        }
        setBusy(false);
    }

    useEffect(() => {
        setBusy(true);
        if(user) {
            let school = "";
            const userRef = doc(db, "userData", user.uid);
            getDoc(userRef).then((userSnap) => {
              if(userSnap.exists()) {
                school = userSnap.data().school;
              }
              dispatch(setUserState(user.displayName, user.email, false, school));
              setBusy(false);
              history.replace("/home");
            }).catch((err) => {
              console.log(err);
              dispatch(setUserState(user.displayName, user.email, false, ""));
              setBusy(false);
              history.replace("/home");
            });
        } else {
            setBusy(false);
        }
        setShowTabs(false);
        return () => {
            setShowTabs(true);
            setBusy(false);
        }
    }, [user, loading]);

    if(busy) {
        return (<IonSpinner class='ion-spinner' name="dots" color="primary" />);
    }
    else {
        return (
            <React.Fragment>
                <IonContent >
    
                    <IonHeader class="ion-no-border" style={{padding: "3vh"}}>
                      <Header />
                    </IonHeader>
    
                    <IonList inset={true} mode='ios' className='sign-in-sign-up-list'>
                        <IonItem mode='ios' >
                            <IonInput clearInput={true} color="transparent" mode='ios' value={emailSignIn} type="text" placeholder="Email" id="emailSignIn" onIonChange={(e: any) => {setEmailSignIn(e.detail.value);}} ></IonInput>
                        </IonItem>
                        <IonItem mode='ios' >
                            <IonInput color="transparent" mode='ios' clearOnEdit={false} value={passwordSignIn} type="password" placeholder="Password" id="passwordSignIn" onIonChange={(e: any) => setPasswordSignIn(e.detail.value)} ></IonInput>
                        </IonItem>
                        <br />
                        <IonButton color="transparent" mode='ios' onClick={logIn} shape="round" fill="outline" expand="block" id="signInButton" >Sign In</IonButton>
                        <br/>
                        <br/>
                    </IonList>
                    <p className='sign-in-sign-up-list'> or <Link to="/register">register</Link> for an account</p>
                </IonContent>
            </React.Fragment>
        )
    }
    
}

export default React.memo(LandingPage);