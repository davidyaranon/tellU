import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import ClearIcon from '@mui/icons-material/Clear';
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
  IonAvatar, IonButton, IonButtons, IonCard,
  IonCardContent, IonCol, IonContent, IonFab,
  IonFabButton, IonGrid, IonHeader, IonIcon,
  IonImg,
  IonItem, IonLabel, IonList, IonModal,
  IonNote, IonPage, IonPopover, IonRow, IonSelect, IonSelectOption, IonSkeletonText,
  IonSpinner, IonText, IonTextarea,
  IonTitle, IonToolbar, RouterDirection, useIonPopover, useIonRouter
} from "@ionic/react";
import FadeIn from "react-fade-in";
import "../App.css";
import TimeAgo from "javascript-time-ago";
import { cameraOutline, shareOutline, chevronBackOutline, alertCircleOutline, banOutline } from "ionicons/icons";
import { getColor, timeout } from '../components/functions';
import Linkify from 'linkify-react';
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage, PhotoViewer } from '@capacitor-community/photoviewer';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Keyboard, KeyboardResize, KeyboardResizeOptions } from "@capacitor/keyboard";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Dialog } from "@capacitor/dialog";
import Clear from "@mui/icons-material/Clear";

interface MatchUserPostParams {
  collectionPath: string;
}
const resizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.None,
}

const defaultResizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.Native,
}

const ChatRoom = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const collectionPath = match.params.collectionPath;
  const schoolName = useSelector((state: any) => state.user.school);
  const [user] = useAuthState(auth);
  const messagesRef = collection(db, 'messages', schoolName.replace(/\s+/g, ""), collectionPath);
  const q = query(messagesRef, orderBy("date", "asc"), limit(100));
  const [messages, loading] = useCollectionData(q);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const router = useIonRouter();
  const timeAgo = new TimeAgo("en-US");
  const [currMessage, setCurrMessage] = useState<string>("");
  const [kbHeight, setKbHeight] = useState<number>(0);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [blob, setBlob] = useState<any | null>(null);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportMessage, setReportMessage] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<any>();
  const Toast = useToast();

  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      });
      // console.log(image);
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if (blobRes) {
        if (blobRes.size > 5_000_000) {
          // 5MB
          Toast.error("Image too large");
        } else {
          setBlob(blobRes);
          setPhoto(image);
        }
      }
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  }

  async function sendImage(blob: any, uniqueId: string) {
    const res = await uploadImage("dmImages", blob, uniqueId);
    if (res == false || photo == null || photo?.webPath == null) {
      Toast.error("unable to select photo");
    } else {
      // Toast.success("photo uploaded successfully");
    }
  }

  const handleCommentSubmit = async () => {
    if (currMessage.trim().length == 0 && photo === null) {

    } else {
      setPhoto(null);
      const tempComment = currMessage;
      setCurrMessage("");
      contentRef && contentRef.current && contentRef.current.scrollToBottom();
      Keyboard.hide();
      let uniqueId = uuidv4();
      let url = "";
      let imgSrc = "";
      if (blob) {
        await sendImage(blob, uniqueId.toString());
        url = "dmImages/" + auth?.currentUser?.uid.toString() + uniqueId;
        imgSrc = await getDownloadURL(ref(storage, url));
        setBlob(null);
      }
      let photoURL = user?.photoURL;
      await addDoc(messagesRef, {
        message: tempComment,
        date: serverTimestamp(),
        uid: user?.uid || "",
        imgSrc,
        photoURL
      });
      await updateDmList(tempComment, contactInfo.uid, contactInfo.userName).catch((err) => {
        Toast.error("DM List not updated, messages will stil be stored");
      });
      if (contactInfo && "notificationsToken" in contactInfo && schoolName) {
        console.log('sending dm to: ', contactInfo.notificationsToken);
        await sendDm(collectionPath, contactInfo.notificationsToken, tempComment, contactInfo.uid);
      }
    }
  };

  const isEnterPressed = (key: any) => {
    if (key === "Enter") {
      handleCommentSubmit();
    }
  };

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

  const reportUser = async () => {
    const { value } = await Dialog.confirm({
      title: 'Report Post',
      message: `Are you sure you want to report this post?`,
      okButtonTitle: 'Report'
    });
    if (value) {
      setShowReportModal(true);
    }
  }

  useEffect(() => {
    if (collectionPath && user) {
      let i = 0;
      let firstUid = "", secondUid = "";
      for (i = 0; i < collectionPath.length; ++i) {
        if (collectionPath[i] == '_') {
          break;
        }
        firstUid += collectionPath[i];
      }
      for (let j = i + 1; j < collectionPath.length; ++j) {
        secondUid += collectionPath[j];
      }
      if (user.uid === firstUid) { // firstUid is current user, so set contactUid to secondUid
        getUserData(secondUid).then((res) => {
          setContactInfo(res);
        })
      } else if (user.uid === secondUid) {
        getUserData(firstUid).then((res) => {
          setContactInfo(res);
        })
      } else {
        Toast.error("Something went wrong getting contact info")
      }
    }
  }, [collectionPath, user])

  useEffect(() => {
    if (messages) {
      contentRef.current && contentRef.current.scrollToBottom(1000);
    }
  }, [messages])

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      Keyboard.setResizeMode(resizeOptions);
      setKbHeight(info.keyboardHeight);
      contentRef && contentRef.current && contentRef.current.scrollToBottom();
    });

    Keyboard.addListener('keyboardWillHide', () => {
      Keyboard.setResizeMode(defaultResizeOptions);
      setKbHeight(0);
    });
    return () => {
      Keyboard.removeAllListeners();
    };
  }, [user, collectionPath, messages, schoolName])

  return (
    <IonPage>
      <IonContent ref={contentRef} scrollEvents>

        <IonModal isOpen={showReportModal} mode="ios">
          {/* <IonHeader translucent> */}
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios">
              <IonButtons slot="start">
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  onClick={() => {
                    setShowReportModal(false);
                  }}
                >
                  Cancel
                </IonButton>
              </IonButtons>
              <IonButtons slot="end">
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  slot="end"
                  onClick={() => {
                    if (reportMessage.length <= 0) {
                      Toast.error("Provide a reason why!");
                    } else {
                      setReportMessage("");
                      // sendReportStatus(reportMessage, schoolName, postKey).then((reportStatus) => {
                      //   if (reportStatus) {
                      //     setShowReportModal(false);
                      //     Toast.success("Post reported");
                      //   } else {
                      //     Toast.error("Something went wrong");
                      //   }
                      // });
                    }
                  }}
                >
                  Report
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </div>
          {/* </IonHeader> */}

          <IonContent>
            <IonCard mode="ios">
              <IonTextarea
                style={{ marginLeft: "2.5%" }}
                rows={4}
                mode="ios"
                value={reportMessage}
                maxlength={500}
                placeholder="Reason for reporting..."
                id="message"
                required={true}
                onIonChange={(e: any) => {
                  let currMessage = e.detail.value;
                  setReportMessage(currMessage);
                }}
              ></IonTextarea>
            </IonCard>
            <IonNote style={{
              textAlign: "center", alignItems: "center",
              alignSelf: "center", display: "flex", fontSize: "1em"
            }}>User will be manually reviewed and might be banned if deemed inappropriate</IonNote>
          </IonContent>
        </IonModal>

        <div slot="fixed" style={{ width: "100%" }}>
          <IonToolbar mode="ios" onClick={() => { if ("uid" in contactInfo && contactInfo.uid) dynamicNavigate('about/' + contactInfo.uid, 'forward') }}>
            {contactInfo &&
              <IonTitle>{contactInfo.userName}</IonTitle>
            }
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonButton
                color={
                  schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  navigateBack();
                }}
              >
                <IonIcon icon={chevronBackOutline}></IonIcon> Back
              </IonButton>
            </IonButtons>
            <IonButtons slot='end'>
              <IonButton color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"} slot="end" onClick={() => { reportUser() }}>
                <IonIcon icon={alertCircleOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </div>

        <IonFab style={darkModeToggled ? { bottom: `${kbHeight}px`, height: "115px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" }
          : { bottom: `${kbHeight}px`, height: "115px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed"
          className={darkModeToggled ? "text-area-dark" : "text-area-light"} vertical="bottom" edge>
          <IonTextarea
            mode="ios"
            enterkeyhint="send"
            rows={3}
            style={photo === null ? { width: "80vw", marginLeft: "2.5vw" }
              : { width: "69vw", marginLeft: "2.5vw" }}
            color="secondary"
            spellcheck={true}
            maxlength={300}
            value={currMessage}
            placeholder={loading ? "Loading..." : "Send a message..."}
            id="DM"
            disabled={loading}
            onKeyDown={e => isEnterPressed(e.key)}
            onIonChange={(e: any) => {
              setCurrMessage(e.detail.value);
            }}
            className={darkModeToggled ? "text-area-dark" : "text-area-light"}
          ></IonTextarea>
          <IonFab vertical="top" horizontal="end">
            <IonGrid>
              <IonRow>
                {photo !== null && photo !== undefined ? (
                  <IonImg className="ion-img-comment" src={photo?.webPath} />
                ) : null}
                {!photo ?
                  <IonFabButton onClick={() => { Keyboard.hide(); takePicture(); }} color="medium" size="small" mode="ios">
                    <IonIcon size="small" icon={cameraOutline} />
                  </IonFabButton>
                  :
                  <IonFabButton onClick={() => { setPhoto(null); setBlob(null) }} color="medium" size="small" mode="ios">
                    <IonIcon size="small" icon={banOutline} />
                  </IonFabButton>
                }
              </IonRow>
            </IonGrid>
          </IonFab>
        </IonFab>

        <FadeIn>
          <div className="ion-modal">
            {messages && messages.length > 0 && contactInfo
              ?
              <>
                {messages?.map((msg: any, index: number) => (
                  <ChatMessage key={msg.uid + '_' + index.toString()} msg={msg} school={schoolName} toggled={schoolColorToggled} />
                ))}
                {kbHeight != 0 ?
                  <>
                    <br /> <br /> <br /><br /> <br /> <br /><br /> <br /> <br /><br /> <br /> <br /><br /> <br /> <br />
                  </>
                  :
                  <>
                    <br /> <br /> <br /> <br /> <br /><br />
                  </>
                }
              </>
              : loading ?
                <>
                  <div className="ion-spinner">
                    <IonSpinner
                      color={
                        schoolName === "Cal Poly Humboldt"
                          && schoolColorToggled
                          ? "tertiary"
                          : "primary"
                      }
                    />
                  </div>
                </>
                : !contactInfo ?
                  <>
                    <div className="ion-spinner">
                      <p style={{ textAlign: "center" }}>ERROR</p>
                    </div>
                  </>
                  :
                  <div className="ion-spinner">
                    <p style={{ textAlign: "center" }}>Send a DM!</p>
                  </div>
            }
            {kbHeight !== 0 || kbHeight > 0 ?
              <>
                <IonItem lines="none" mode="ios" disabled>
                </IonItem>
                <IonItem lines="none" mode="ios" disabled>
                </IonItem>
                <IonItem lines="none" mode="ios" disabled>
                </IonItem>
                <IonItem lines="none" mode="ios" disabled>
                </IonItem>
              </>
              :
              null}
          </div>
        </FadeIn>

      </IonContent>
    </IonPage >
  );
};

function ChatMessage(props: any) {
  const { message, uid, imgSrc, photoURL, date } = props.msg;
  const schoolName = props.school;
  const schoolColorToggled = props.toggled;
  const timeAgo = new TimeAgo("en-US");
  let messageClass = uid === auth?.currentUser?.uid ? 'sent' : 'received';
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
  const Popover = () => <IonContent className="ion-padding">{getDate(date)}</IonContent>;

  const [present, dismiss] = useIonPopover(Popover, {
    onDismiss: (data: any, role: string) => {},
  });
  
  const router = useIonRouter();

  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }

  if (messageClass === 'sent' && schoolName === 'Cal Poly Humboldt' && schoolColorToggled) {
    messageClass = 'sent-humboldt';
  }
  return (
    <>
      <div className={`message ${messageClass}`}>
        <div style={{ textAlign: "right", borderRadius: "10px" }}>
          {messageClass === 'received' && imgSrc && imgSrc.length > 0 &&
            <img onClick={() => { dynamicNavigate("about/" + uid, 'forward'); }} className='dm-img' src={photoURL} />
          }
          {imgSrc && imgSrc.length > 0 &&
            <img style={{ width: "50vw", borderRadius: "10px", marginRight: "10px" }} src={imgSrc}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage = {
                  url: imgSrc,
                };
                CapacitorPhotoViewer.show({
                  images: [img],
                  mode: 'one',
                  options: {
                    title: true
                  },
                  startFrom: 0
                }).catch((err) => {
                  console.log('Unable to open image on web version');
                });
              }}
            />
          }
        </div>
      </div>

      <div className={`message ${messageClass}`}>
        {messageClass === 'received' && message && message.length > 0 &&
          <img onClick={() => { dynamicNavigate("about/" + uid, 'forward'); }} className='dm-img' src={photoURL} />
        }
        {message && message.length > 0 &&
          <>
            <p onClick={(e: any) =>
              present({
                event: e,
              })
            } >{message}</p>
          </>
        }
      </div>
    </>
  )
}

export default ChatRoom;