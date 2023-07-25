/* React + Ionic/Capacitor */
import {
  IonBackButton,
  IonButton, IonButtons, IonCard, IonContent, IonFab,
  IonFabButton, IonGrid, IonHeader, IonIcon, IonImg,
  IonItem, IonModal, IonNote, IonPage, IonRow, IonSpinner, IonTextarea,
  IonTitle, IonToolbar, RouterDirection, useIonRouter
} from "@ionic/react";
import FadeIn from "react-fade-in/lib/FadeIn";
import { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Dialog } from "@capacitor/dialog";
import { cameraOutline, chevronBackOutline, alertCircleOutline, banOutline } from "ionicons/icons";
import { Keyboard, KeyboardResize, KeyboardResizeOptions } from "@capacitor/keyboard";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';

/* Firebase */
import {
  addDoc, collection,
  limit, orderBy,
  query, serverTimestamp,
} from "firebase/firestore";
import auth, {
  getUserData, db, sendDm, storage, updateDmList, uploadImage,
} from '../fbConfig';
import { getDownloadURL, ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from 'react-firebase-hooks/firestore';

/* CSS */
import "../App.css";

/* Other components */
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@agney/ir-toast";
import { useContext } from "../my-context";
import { dynamicNavigate } from "../components/Shared/Navigation";
import { timeout } from "../helpers/timeout";


interface MatchUserPostParams {
  collectionPath: string;
  schoolName: string;
}
const resizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.None,
}

const defaultResizeOptions: KeyboardResizeOptions = {
  mode: KeyboardResize.Body,
}

const ChatRoom = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const collectionPath = match.params.collectionPath;
  const schoolName = match.params.schoolName;

  /* Hooks */
  const [user] = useAuthState(auth);
  const router = useIonRouter();
  const Toast = useToast();
  const context = useContext();

  /* Firebase Messages */
  const messagesRef = collection(db, 'messages', schoolName.replace(/\s+/g, ""), collectionPath);
  const q = query(messagesRef, orderBy("date", "asc"), limit(100));
  const [messages, loading] = useCollectionData(q);

  /* State Variables */
  const [currMessage, setCurrMessage] = useState<string>("");
  const [kbHeight, setKbHeight] = useState<number>(0);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [blob, setBlob] = useState<any | null>(null);
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportMessage, setReportMessage] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<any>();
  const [contactPhoto, setContactPhoto] = useState<string>("");

  /**
   * @description This function is used to select a photo from the user's photo gallery
   */
  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      });
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if (blobRes) {
        if (blobRes.size > 5_000_000) {
          // 5MB
          const toast = Toast.create({ message: 'Image size too large', duration: 2000, color: 'toast-error' });
          toast.present();
        } else {
          setBlob(blobRes);
          setPhoto(image);
        }
      } else {
        const toast = Toast.create({ message: 'Image not supported', duration: 2000, color: 'toast-error' });
        toast.present();
      }
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  }

  /**
   * @description This function is used to send an image to the user through DMs
   * The image is uploaded to Firestore storage at /dmImages/{userUid}
   * 
   * @param blob photo data
   * @param uniqueId User ID of the user who sent the photo
   */
  async function sendImage(blob: any, uniqueId: string) {
    const res = await uploadImage("dmImages", blob, uniqueId);
    if (res == false || photo == null || photo?.webPath == null) {
      const toast = Toast.create({ message: 'Unable to select photo', duration: 2000, color: 'toast-error' });
      toast.present();
    } else {
      // Toast.success("photo uploaded successfully");
    }
  }

  /**
   * @description This function is used to send a DM to the user
   * The DM is uploaded to Firestore at /messages/{schoolName}/{userUid1_userUid2}
   */
  const handleCommentSubmit = async () => {
    if (currMessage.trim().length == 0 && photo === null) {
      Keyboard.hide();
    } else {
      setPhoto(null);
      const tempComment = currMessage;
      setCurrMessage("");
      contentRef && contentRef.current && contentRef.current.scrollToBottom(500);
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
        const toast = Toast.create({ message: 'DM List not updated, messages will stil be stored', duration: 2000, color: 'toast-error' });
        toast.present();
      });
      if (contactInfo && "notificationsToken" in contactInfo && schoolName) {
        console.log('sending dm to: ', contactInfo.notificationsToken);
        await sendDm(collectionPath, contactInfo.notificationsToken, tempComment, contactInfo.uid, schoolName);
      }
    }
  };

  /**
   * @description This function is used to determine if a user prsses Enter (or Send on iOS)
   * @param key the key a user presses
   */
  const isEnterPressed = (key: any) => {
    if (key === "Enter") {
      handleCommentSubmit();
    }
  };

  /**
   * @description This function is used to open the report modal
   */
  const reportUser = async () => {
    const { value } = await Dialog.confirm({
      title: 'Report User',
      message: `Are you sure you want to report this user?`,
      okButtonTitle: 'Report'
    });
    if (value) {
      setShowReportModal(true);
    }
  }

  /**
   * @description Gets all user info for DM page
   */
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
        getUserData(secondUid).then(async (res: any) => {
          setContactInfo(res);
          let url = "profilePictures/" + res.uid + "photoURL";
          let imgSrc: string = await getDownloadURL(ref(storage, url));
          setContactPhoto(imgSrc);
        });
      } else if (user.uid === secondUid) {
        getUserData(firstUid).then(async (res: any) => {
          setContactInfo(res);
          let url = "profilePictures/" + res.uid + "photoURL";
          let imgSrc: string = await getDownloadURL(ref(storage, url));
          setContactPhoto(imgSrc);
        })
      } else {
        const toast = Toast.create({ message: 'Something went wrong getting contact info', duration: 2000, color: 'toast-error' });
        toast.present();
      }
    }
  }, [collectionPath, user])

  /**
   * @description Scrolls to bottom of DM page on load
   */
  useEffect(() => {
    if (messages) {
      timeout(750).then(() => {
        contentRef.current && contentRef.current.scrollToBottom(1000);
      })
    }
  }, [messages])

  /**
   * @description adds keyboard listener to hide keyboard when user clicks outside of keyboard
   */
  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      Keyboard.setResizeMode(resizeOptions);
      setKbHeight(info.keyboardHeight);
      contentRef && contentRef.current && contentRef.current.scrollToBottom(500);
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
      <IonHeader>
        <IonToolbar onClick={() => { console.log("HI"); if ("uid" in contactInfo && contactInfo.uid) dynamicNavigate(router, '/about/' + schoolName + "/" + contactInfo.uid, 'forward') }}>
          {contactInfo &&
            <IonTitle style={{ marginLeft: "9%", width: "90vw" }}>{contactInfo.userName}</IonTitle>
          }
          <IonButtons style={{ marginLeft: "-2.5%" }}>
            <IonBackButton
              defaultHref="/home"
              className="back-button"
              icon={chevronBackOutline}
              text={"Back"}
              color={context.schoolColorToggled ? "tertiary" : "primary"}
            >
            </IonBackButton>
          </IonButtons>
          <IonButtons slot='end'>
            <IonButton color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"} slot="end" onClick={(e: any) => { e.stopPropagation(); reportUser() }}>
              <IonIcon icon={alertCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} scrollEvents>

        <IonModal isOpen={showReportModal} mode="ios" handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
          <div slot="fixed" style={{ width: "100%" }}>
            <IonToolbar mode="ios">
              <IonButtons slot="start">
                <IonButton
                  color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
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
                  color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
                  mode="ios"
                  slot="end"
                  onClick={() => {
                    if (reportMessage.length <= 0) {
                      const toast = Toast.create({ message: 'Provide a reason why!', duration: 2000, color: 'toast-error' });
                      toast.present();
                    } else {
                      setReportMessage("");
                    }
                  }}
                >
                  Report
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </div>

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

        <IonFab style={context.darkMode ? { bottom: `${kbHeight}px`, height: "115px", width: "100vw", border: '2px solid #282828', borderRadius: "10px" }
          : { bottom: `${kbHeight}px`, height: "115px", width: "100vw", border: '2px solid #e6e6e6', borderRadius: "10px" }} slot="fixed"
          className={context.darkMode ? "text-area-dark" : "text-area-light"} vertical="bottom" edge>
          <IonTextarea
            mode="ios"
            enterkeyhint="send"
            rows={3}
            style={photo === null ? { width: "80vw", marginLeft: "2.5vw" }
              : { width: "69vw", marginLeft: "2.5vw" }}
            color={context.darkMode ? "light" : "black"}
            spellcheck={true}
            maxlength={300}
            value={currMessage}
            placeholder={loading ? "Loading..." : "Send a message..."}
            id="DM"
            disabled={loading || !contactInfo}
            onKeyDown={e => isEnterPressed(e.key)}
            onIonChange={(e: any) => {
              setCurrMessage(e.detail.value);
            }}
            className={context.darkMode ? "text-area-dark" : "text-area-light"}
          ></IonTextarea>
          <IonFab vertical="top" horizontal="end">
            <IonGrid>
              <IonRow>
                {photo !== null && photo !== undefined ? (
                  <IonImg className="ion-img-comment" src={photo?.webPath} />
                ) : null}
                {!photo ?
                  <IonFabButton onClick={() => { Keyboard.hide(); takePicture(); }} color={context.darkMode ? "medium" : "medium-light"} size="small" mode="ios">
                    <IonIcon size="small" icon={cameraOutline} />
                  </IonFabButton>
                  :
                  <IonFabButton onClick={() => { setPhoto(null); setBlob(null) }} color={context.darkMode ? "medium" : "medium-light"} size="small" mode="ios">
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
                  <FadeIn key={msg.uid + '_' + index.toString()} transitionDuration={500}>
                    <ChatMessage msg={msg} school={schoolName} toggled={context.schoolColorToggled} photo={contactPhoto} />
                  </FadeIn>
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
                          && context.schoolColorToggled
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
                  <FadeIn delay={1000}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", transform: "translateY(25vh)" }}>
                      <p style={{ textAlign: "center", }}>Send a DM!</p>
                    </div>
                  </FadeIn>
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

/**
 * @param props {photo: string, message: string, school: string, toggled: boolean}
 * @returns a chat bubble containing a message and possible image, colored based on the schoolColorToggled state
 */
function ChatMessage(props: any) {
  const { message, uid, imgSrc, photoURL, date } = props.msg;
  const photo = props.photo;
  const schoolName = props.school;
  const schoolColorToggled = props.toggled;
  const router = useIonRouter();

  let messageClass = uid === auth?.currentUser?.uid ? 'sent' : 'received';

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
            <img onClick={() => { dynamicNavigate("/about/" + schoolName + "/" + uid, 'forward'); }} className='dm-img' src={photo || photoURL} />
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
          <img onClick={() => { dynamicNavigate("/about/" + schoolName + "/" + uid, 'forward'); }} className='dm-img' src={photo || photoURL} />
        }
        {message && message.length > 0 &&
          <>
            <p
              onClick={(e: any) => { }
              } >{message}
            </p>
          </>
        }
      </div>
    </>
  )
}

export default ChatRoom;