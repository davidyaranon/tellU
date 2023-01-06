import { IonFooter, IonProgressBar } from "@ionic/react"
import { useContext } from "../../my-context";
import FadeIn from "react-fade-in/lib/FadeIn";

export const ProgressBar = (props: any) => {
  const schoolName = props.schoolName;
  const context = useContext();
  return (
    <FadeIn>
      <IonFooter mode='ios' slot="bottom">
        <IonProgressBar type="indeterminate" color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"} style={{ height: "0.5vh" }}></IonProgressBar>
      </IonFooter>
    </FadeIn>
  )
}