import { IonContent, IonHeader, IonButton, IonLoading, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption } from '@ionic/react';
import React, { useEffect, useState  } from 'react';
import { auth, registerWithEmailAndPassword } from '../fbconfig'
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import Header from "./Header"
import '../App.css'
import { useHistory } from 'react-router';
import UIContext from '../my-context'
import { useToast } from "@agney/ir-toast";
import { useDispatch } from "react-redux"
import { setUserState } from '../redux/actions';

const Register: React.FC = () => {
    const Toast = useToast();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);
    const { setShowTabs } = React.useContext(UIContext);
    const [emailSignUp, setEmailSignUp] = useState("");
    const [userNameSignUp, setUserNameSignUp] = useState("");
    const [passwordSignUp, setPasswordSignUp] = useState("");
    const [passwordSignUpCopy, setPasswordSignUpCopy] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const history = useHistory();

    async function register() {
        setBusy(true);
        if (userNameSignUp.trim() === '' || passwordSignUp.trim() === '' || emailSignUp.trim() === '') { 
            Toast.error("Enter a value in each field");  
        }
        else if(schoolName.length == 0) {
            Toast.error("Select a university!");
        }
        else if(userNameSignUp.trim().length > 15) {
            Toast.error("Username must be less than 15 characters!");
        }
        else if(passwordSignUp !== passwordSignUpCopy) { 
            Toast.error("Passwords do not match!");
        }
        else if(passwordSignUp.length < 8) {
            Toast.error("Password must be 8 or more characters!")
        }
        else if(userNameSignUp.includes(' ')) {
            Toast.error("Username cannot contain spaces!");
        }
        else if(passwordSignUp.includes(' ')) {
            Toast.error("Password cannot contain spaces!");
        }
        else {
            const res = await registerWithEmailAndPassword(userNameSignUp.trim(), emailSignUp.trim(), passwordSignUp, schoolName);
            if ( (typeof(res) === 'string') ) {
                Toast.error(res);
            }
            else {
                dispatch(setUserState(res!.user.displayName, res!.user.email, false));
                Toast.success("Registered Successfully");
            }
        }
        setBusy(false);
    }
    useEffect(() => {
        setBusy(true);
        if(user) {
            dispatch(setUserState(user.displayName, user.email, false));
            history.replace("/home");
        }
        setShowTabs(false);
        setBusy(false);
        return () => {
            setShowTabs(true);
        }
    }, [user, loading]);

    return (
        <React.Fragment>
            <IonContent>

                <IonHeader class="ion-no-border" style={{padding: "3vh"}}>
                  <Header />
                </IonHeader>

                <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>

                <IonList mode='ios' inset={true} className='sign-in-sign-up-list'> 
                    <IonItem class="ion-item-style">
                        <IonLabel position='stacked'>Email</IonLabel>
                        <IonInput value={emailSignUp} type="email" placeholder="email@email.com" id="emailSignUp" onIonChange={(e: any) => setEmailSignUp(e.detail.value)} ></IonInput>
                    </IonItem>
                    <IonItem class="ion-item-style">
                        <IonLabel position='stacked'>School</IonLabel>
                        <IonSelect value={schoolName} placeholder="University of California" onIonChange={(e: any) => setSchoolName(e.detail.value)}>
                            <IonSelectOption value="UC Berkeley">UC Berkeley</IonSelectOption>
                            <IonSelectOption value="UC Davis">UC Davis</IonSelectOption>
                            <IonSelectOption value="UC Irvine">UC Irvine</IonSelectOption>
                            <IonSelectOption value="UCLA">UCLA</IonSelectOption>
                            <IonSelectOption value="UC Merced">UC Merced</IonSelectOption>
                            <IonSelectOption value="UC Riverside">UC Riverside</IonSelectOption>
                            <IonSelectOption value="UC San Diego">UC San Diego</IonSelectOption>
                            <IonSelectOption value="UCSF">UCSF</IonSelectOption>
                            <IonSelectOption value="UC Santa Barbara">UC Santa Barbara</IonSelectOption>
                            <IonSelectOption value="UC Santa Cruz">UC Santa Cruz</IonSelectOption>
                            <IonSelectOption disabled={true} value="More schools to come!...">More schools to come!...</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                    <IonItem class="ion-item-style">
                    <IonLabel position='stacked'>Username</IonLabel>
                        <IonInput value={userNameSignUp} type="text" placeholder="quantum1234" id="userNameSignUp" onIonChange={(e: any) => setUserNameSignUp(e.detail.value)} ></IonInput>
                    </IonItem>
                    <IonItem class="ion-item-style">
                    <IonLabel position='stacked'>Password</IonLabel>
                        <IonInput value={passwordSignUp} clearOnEdit={false} type="password" placeholder="••••••••" id="passwordSignUp" onIonChange={(e: any) => setPasswordSignUp(e.detail.value)} ></IonInput>
                    </IonItem>
                    <IonItem class="ion-item-style">
                    <IonLabel position='stacked'>Enter password again</IonLabel>
                        <IonInput value={passwordSignUpCopy} clearOnEdit={false} type="password" placeholder="••••••••" id="passwordSignUpCopy" onIonChange={(e: any) => setPasswordSignUpCopy(e.detail.value)} ></IonInput>
                    </IonItem>
                    <br />
                    <IonButton onClick={register} color="transparent" mode='ios' shape="round" fill="outline" expand="block"  id="signUpButton" >Sign Up</IonButton>
                    <br />
                    <br />
                    <p className='sign-in-sign-up-list'> or <Link to="/landing-page">sign in</Link> to an exising account</p>
                </IonList>
            </IonContent>
        </React.Fragment>
    )
}

export default React.memo(Register);