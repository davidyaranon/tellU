import { IonSpinner, IonPage } from '@ionic/react'
import React from 'react';

function Spinner() {
    return (
        <IonPage>
            <IonSpinner class='ion-spinner' name="dots" color="primary" />
        </IonPage>
    )
}

export default Spinner;