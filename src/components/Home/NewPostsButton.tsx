import {IonFab, IonFabButton, IonIcon} from "@ionic/react";
import { refreshCircleOutline } from "ionicons/icons";
import { useContext } from "../../my-context";

export const NewPostsButton = (props : any) => {
  const schoolName = props.schoolName;
  const handleNewPostsButtonClicked = props.handleNewPostsButtonClicked;

  const context = useContext();

  return (
    <IonFab style={{ top: "5vh" }} horizontal="center" slot="fixed">
      <IonFabButton color={"primary"} className="load-new-posts" mode="ios"
        onClick={() => { handleNewPostsButtonClicked() }}>
        New Posts
        <IonIcon icon={refreshCircleOutline} />
      </IonFabButton>
    </IonFab>
  )
}