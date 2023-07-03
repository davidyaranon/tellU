import { IonFab, IonNote } from "@ionic/react";
import { useHistory } from "react-router";
import { getColor } from "../../helpers/getColor";
import RoomIcon from '@mui/icons-material/Room';
import { getDate } from "../../helpers/timeago";

export const PostType = (props: any) => {
  let type = props.type;
  const marker = props.marker;
  const POI = props.POI;
  const timestamp = props.timestamp;
  const schoolName = props.schoolName;

  const history = useHistory();

  if (type) {
    return (
      <IonFab vertical="top" horizontal="end" onClick={(e) => {
        if(type === "buy/Sell") {
          type = "buySell";
        }
        if (type !== "general") {
          e.stopPropagation();
          history.push("/type/" + schoolName + "/" + type);
        }
      }}>
        {type !== "general" ?
          <p style={{ fontWeight: "bold", color: getColor(type), fontSize : ".65em", margin: 0 }} >
            {type.toUpperCase()}
            &nbsp;
            {marker && POI && POI.length > 0 ? (
              <RoomIcon
                style={{ fontSize: "1em" }}
                onClick={(e) => {
                  e.stopPropagation();
                  history.push("/markerInfo/" + schoolName + "/" + POI);
                }}
              />
            ) : null}
          </p>
          :
          <p style={{ fontWeight: "bold", color: getColor(type), marginLeft: "75%" }} >
            {marker && POI && POI.length > 0 ? (
              <RoomIcon onClick={(e) => {
                e.stopPropagation();
                history.push("/markerInfo/" + schoolName + "/" + POI);
              }}
                style={{ fontSize: "1em" }} />) : null}
          </p>
        }
        <IonNote style={{ fontSize: "0.55em" }}> {getDate(timestamp)} </IonNote>
      </IonFab>
    )
  } else {
    return (
      <IonFab vertical="top" horizontal="end">
        <IonNote style={{ fontSize: "0.5em" }}> {getDate(timestamp)} </IonNote>
      </IonFab>
    )
  }
}