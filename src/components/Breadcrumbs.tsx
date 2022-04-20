import { IonBreadcrumb, IonBreadcrumbs } from "@ionic/react";


export const Breadcrumbs = () => {

    return (
        <IonBreadcrumbs mode="ios">
            <IonBreadcrumb mode="ios">
                Page 1
            </IonBreadcrumb>
            <IonBreadcrumb mode="ios">
                Page 2
            </IonBreadcrumb>
            <IonBreadcrumb mode="ios">
                Page 3
            </IonBreadcrumb>
        </IonBreadcrumbs>
    );
}