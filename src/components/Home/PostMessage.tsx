import { IonNote } from "@ionic/react";
import { useContext } from "../../my-context";
import Linkify from 'linkify-react';
import { useHistory } from "react-router";

export const PostMessage = (props: any) => {
  const className = props.className;
  const classNumber = props.classNumber;
  const message = props.message;
  const reports = props.reports;
  const schoolName = props.schoolName;

  const context = useContext();
  const history = useHistory();

  if (className && className.length > 0) {
    return (
      <>
        <div style={{ height: "0.75vh", }}>{" "}</div>
        <Linkify style={context.sensitivityToggled && reports > 1 ? { filter: "blur(0.25em)" } : {}} tagName="h3" className="h2-message">
          {message}
          <IonNote
            onClick={(e) => {
              e.stopPropagation();
              history.push("/class/" + schoolName + "/" + className);
            }}
            color="primary"
            style={{ fontWeight: "400" }}
          >
            &nbsp; — {className}{classNumber || ''}
          </IonNote>
        </Linkify>
      </>
    )
  } else {
    return (
      <>
        <div style={{ height: "0.75vh", }}>{" "}</div>
        <Linkify style={context.sensitivityToggled && reports > 1 ? { filter: "blur(0.25em)" } : {}} tagName="h3" className="h2-message"> {message} </Linkify>
      </>
    )
  }
}