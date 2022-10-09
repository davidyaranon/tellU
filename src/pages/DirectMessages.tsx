import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import auth,
{
  addCommentNew, downVoteComment, getClassPostsDb, getLikes, getUserData, sendDm, sendDmNotification, sendReportStatus, storage, updateDmList, uploadImage,
} from '../fbconfig';
import { db, promiseTimeout } from "../fbconfig";
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc,
  doc, getDoc, getDocs, getFirestore, increment, limit, orderBy,
  query, runTransaction, serverTimestamp, setDoc, startAfter,
  updateDoc, where, writeBatch,
} from "firebase/firestore";
import { useToast } from "@agney/ir-toast";
import RoomIcon from '@mui/icons-material/Room';
import {
  IonAvatar, IonBadge, IonButton, IonButtons, IonCard,
  IonCardContent, IonCol, IonContent, IonFab,
  IonFabButton, IonGrid, IonHeader, IonIcon,
  IonImg,
  IonItem, IonLabel, IonList, IonModal,
  IonNote, IonPage, IonRow, IonSelect, IonSelectOption, IonSkeletonText,
  IonSpinner, IonText, IonTextarea,
  IonTitle, IonToolbar, RouterDirection, useIonRouter, useIonViewWillEnter
} from "@ionic/react";
import FadeIn from "react-fade-in";
import "../App.css";
import TimeAgo from "javascript-time-ago";
import { cameraOutline, shareOutline, chevronBackOutline, alertCircleOutline } from "ionicons/icons";
import { getColor, timeout } from '../components/functions';
import Linkify from 'linkify-react';
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage, PhotoViewer } from '@capacitor-community/photoviewer';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Keyboard, KeyboardResize, KeyboardResizeOptions } from "@capacitor/keyboard";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Dialog } from "@capacitor/dialog";
import { setNotif } from "../redux/actions";

interface MatchUserPostParams {
  directMessageId: string;
}

const DirectMessages = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const userUid = match.params.directMessageId;
  const schoolName = useSelector((state: any) => state.user.school);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const router = useIonRouter();
  const [user] = useAuthState(auth);
  const messagesRef = collection(db, 'userData', user?.uid || "", 'messages');
  const q = query(messagesRef, orderBy("date", "desc"), limit(100));
  const [messages, loading] = useCollectionData(q);
  const timeAgo = new TimeAgo("en-US");
  const Toast = useToast();
  const dispatch = useDispatch();

  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }
  const navigateBack = () => {
    if (router.canGoBack()) {
      router.goBack();
    } else {
      dynamicNavigate('home', 'back');
    }
  }

  const getDate = (timestamp: any) => {
    if (!timestamp) {
      return '';
    }
    if ("seconds" in timestamp && "nanoseconds" in timestamp) {
      const time = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      );
      return timeAgo.format(time);
    } else {
      return '';
    }
  };

  useIonViewWillEnter(() => {
    dispatch(setNotif(false));
  })

  return (
    <IonPage>
      <IonContent scrollEvents>

        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios">
            <IonTitle>DMs</IonTitle>
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonButton
                color={
                  schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"
                }
                onClick={() => {
                  navigateBack();
                }}
              >
                <IonIcon icon={chevronBackOutline}></IonIcon> Back
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>

        <div className='ion-modal'>
          <br /><br />
          <FadeIn>
            {
              messages &&
              messages.map((msg: any, index: number) => {
                return (

                  <div className="chat" key={msg.contactUid + '-' + index.toString()} onClick={() => {
                    let elements: any[] = [];
                    if (userUid && msg.contactUid) {
                      if (userUid < msg.contactUid) {
                        elements.push(msg.contactUid);
                        elements.push(userUid);
                      } else {
                        elements.push(userUid);
                        elements.push(msg.contactUid);
                      }
                      console.log(elements[0] + '_' + elements[1]);
                    } else {
                      Toast.error("Unable to open DMs");
                    }
                    dynamicNavigate("/chatroom/" + elements[0] + '_' + elements[1], 'forward')
                  }
                  }>
                    <IonCol size="2">
                      <img className="chat_avatar" src={msg.photoURL} />
                    </IonCol>
                    <IonCol size="7">
                      <div className="chat_info">
                        <div className="contact_name">{msg.userName}</div>
                        <div className={"read" in msg && msg.read === false ? "contactMsgBold" : "contactMsg"}>{msg.recent.length > 25 ?
                          msg.recent.slice(0, 25) + "..."
                          : msg.recent.length == 0 ?
                            '[picture]'
                            : msg.recent}
                        </div>
                      </div>
                    </IonCol>
                    <IonCol size="3.5">
                      <div className="chat_date">{getDate(msg.date)}</div>
                      {"read" in msg && msg.read == false && <div className="chat_new grad_pb">Reply</div>}
                    </IonCol>
                  </div>

                )
              })
            }
          </FadeIn>
        </div>

      </IonContent>
    </IonPage>
  )
};

export default DirectMessages;