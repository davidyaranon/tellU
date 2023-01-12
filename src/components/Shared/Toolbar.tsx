/**
 * Returns navigation toolbar to use for going back when entering a new page
 */

import { useToast } from "@agney/ir-toast";
import { Dialog } from "@capacitor/dialog";
import { IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from "@ionic/react";
import { alertCircleOutline, chatbubbleOutline, chevronBackOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import '../../App.css';
import { useContext } from "../../my-context";

export const Toolbar = (props: any) => {
  const title = props.title;
  const schoolName = props.schoolName;
  const text = props.text;
  const color = props.color;
  const setShowReportModal = props.setShowReportModal;
  const deleteButton = props.deleteButton;
  const deleteAccount = props.deleteAccount;
  const dm = props.dm;
  const user = props.user;
  const uid = props.uid;

  const Toast = useToast();
  const history = useHistory();
  const context = useContext();

  /**
   * @description Shows dialog confirming if user wants to report the post
   * and if so, opens the report modal
   */
  const reportPost = async () => {
    const { value } = await Dialog.confirm({
      title: 'Report Post',
      message: `Are you sure you want to report this post?`,
      okButtonTitle: 'Report'
    });
    if (value) {
      setShowReportModal(true);
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          {title && title.length > 0 && <IonTitle style={{ fontSize: "1.2em" }}>{title}</IonTitle>}
          <IonButtons style={{ marginLeft: "-2.5%" }}>
            <IonBackButton
              defaultHref="/home"
              className="back-button"
              icon={chevronBackOutline}
              text={text || "Back"}
              color={color ? color : context.schoolColorToggled ? "tertiary" : "primary"}
            >
            </IonBackButton>
          </IonButtons>
          {schoolName && setShowReportModal &&
            <IonButtons slot='end'>
              <IonButton color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"} slot="end" onClick={() => { reportPost(); }}>
                <IonIcon icon={alertCircleOutline} />
              </IonButton>
            </IonButtons>
          }
          {dm && user && user.uid !== uid &&
            <IonButtons slot='end'>
              <IonButton
                color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
                slot="end"
                mode="ios"
                onClick={() => {
                  let elements: any[] = [];
                  if (user && user.uid && uid) {
                    if (user.uid < uid) {
                      elements.push(uid);
                      elements.push(user.uid);
                    } else {
                      elements.push(user.uid);
                      elements.push(uid);
                    }
                    history.push("/chatroom/" + schoolName + "/" +  elements[0] + '_' + elements[1], 'forward');
                  } else {
                    console.log(user.uid)
                    console.log(user);
                    console.log(uid);
                    const toast = Toast.create({ message: 'Unable to open DMs', duration: 2000, color: 'toast-error' });
                    toast.present();
                  }
                }}
              >
                <IonIcon icon={chatbubbleOutline} />
              </IonButton>
            </IonButtons>
          }
          {deleteButton &&
            <IonButtons slot="end">
              <IonButton
                onClick={() => deleteAccount()}
                color="toast-error"
                mode="ios"
                fill="clear"
                id="deleteAccount"
              >
                Delete Account
              </IonButton>
            </IonButtons>
          }
        </IonToolbar>
      </IonHeader>
    </>
  )
}