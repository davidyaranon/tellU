import { IonFab, IonNote } from "@ionic/react";
import { useHistory } from "react-router";
import { getColor } from "../../helpers/getColor";
import RoomIcon from '@mui/icons-material/Room';
import { getDate } from "../../helpers/timeago";

export const PostType = (props: any) => {
  const type = props.type;
  const marker = props.marker;
  const location = props.location;
  const timestamp = props.timestamp;
  const schoolName = props.schoolName;

  const history = useHistory();

  if (type) {
    return (
      <IonFab vertical="top" horizontal="end" onClick={(e) => {
        if (type !== "general") {
          e.stopPropagation();
          history.push("/type/" + schoolName + "/" + type);
        }
      }}>
        {type !== "general" ?
          <p style={{ fontWeight: "bold", color: getColor(type) }} >
            {type.toUpperCase()}
            &nbsp;
            {marker ? (
              <RoomIcon
                style={{ fontSize: "1em" }}
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem("lat", (location[0].toString()));
                  localStorage.setItem("long", (location[1].toString()));
                  history.push("/maps");
                }}
              />
            ) : null}
          </p>
          :
          <p style={{ fontWeight: "bold", color: getColor(type), marginLeft: "75%" }} >
            {marker ? (
              <RoomIcon onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem("lat", (location[0].toString()));
                localStorage.setItem("long", (location[1].toString()));
                history.push("/maps");
              }}
                style={{ fontSize: "1em" }} />) : null}
          </p>
        }
        <IonNote style={{ fontSize: "0.85em" }}> {getDate(timestamp)} </IonNote>
      </IonFab>
    )
  } else {
    return (
      <IonFab vertical="top" horizontal="end">
        <IonNote style={{ fontSize: "0.85em" }}> {getDate(timestamp)} </IonNote>
      </IonFab>
    )
  }
}