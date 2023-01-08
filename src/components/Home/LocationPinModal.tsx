/* Ionic/React + Capacitor */
import {
  IonButton, IonButtons, IonCheckbox, IonHeader,
  IonItem, IonLabel, IonList, IonModal, IonNote, IonRadio, IonRadioGroup, IonTitle, IonToolbar, useIonLoading
} from "@ionic/react";
import { useState } from "react";
import { Geolocation, GeolocationOptions, Geoposition } from "@awesome-cordova-plugins/geolocation";

/* Firebase/Google */
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addMessage, storage } from "../../fbConfig";

/* Other Components */
import { v4 as uuidv4 } from "uuid";
import Map from "@mui/icons-material/Map";
import { useToast } from "@agney/ir-toast";
import { useContext } from "../../my-context";
import { Preferences } from "@capacitor/preferences";

/* options for getting user's location using {@awesome-cordova-plugins/geolocation} */
const locationOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000
};

export const LocationPinModal = (props: any) => {

  /* props */
  const isOpen = props.isOpen;
  const user = props.user;
  const blob = props.blob;
  const photo = props.photos;
  const setPhoto = props.setPhoto;
  const setBlob = props.setBlob;
  const inputRef = props.inputRef;
  const schoolName = props.schoolName;
  const setShowModal = props.setShowModal;
  const setGifModal = props.setGifModal;
  const setPostClassName = props.setPostClassName;
  const setPostClassNumber = props.setPostClassNumber;
  const setPrevPostUploading = props.setPrevPostUploading;
  const setShowProgressBar = props.setShowProgressBar;
  const postClassName = props.postClassName;
  const postClassNumber = props.postClassNumber;
  const setLocationPinModal = props.setLocationPinModal;

  /* hooks */
  const context = useContext();
  const Toast = useToast();
  const [present, dismiss] = useIonLoading();

  /* state variables */
  const [locationChecked, setLocationChecked] = useState<boolean>(false);
  const [position, setPosition] = useState<Geoposition | null>();
  const [checkboxSelection, setCheckboxSelection] = useState<string>("general");

  /**
   * @description Adds a message as a doc in Firestore
   * Includes message data like message, photos, uniqueId (docId), position, 
   * schoolName, notificationsToken, checkboxSelection (postType)
   */
  const messageAdd = async () => {
    console.log(checkboxSelection)
    const messageRefValue = inputRef.current;
    if (!messageRefValue) {
      const toast = Toast.create({ message: 'Input a message!', duration: 2000, color: 'toast-error' });
      toast.present();
      return;
    }
    const message = messageRefValue.value || "";
    if (message.trim().length == 0 && (!blob || blob.length == 0) && (!photo || photo.length == 0)) {
      const toast = Toast.create({ message: 'Input a message!', duration: 2000, color: 'toast-error' });
      toast.present();
    } else if (checkboxSelection === "") {
      const toast = Toast.create({ message: 'Select a post type', duration: 2000, color: 'toast-error' });
      toast.present();
    } else {
      setPrevPostUploading(true);
      setShowProgressBar(true);
      let uniqueId = uuidv4();
      let docId = uuidv4();
      if (blob && photo) {
        setPhoto([]);
        if (user) {
          const promises = [];
          const currentUserUid = user.uid;
          for (var i = 0; i < blob.length; i++) {
            const file = blob[i];
            let storageRef = ref(storage, "images/" + currentUserUid.toString() + uniqueId + i.toString());
            promises.push(uploadBytes(storageRef, file).then(uploadResult => { return getDownloadURL(uploadResult.ref) }))
          }
          const photos = await Promise.all(promises);
          const notificationsToken = localStorage.getItem("notificationsToken") || "";
          console.log(notificationsToken);
          const res = await addMessage(
            message,
            photos,
            uniqueId.toString(),
            position,
            schoolName,
            notificationsToken,
            checkboxSelection,
            postClassName,
            postClassNumber,
            docId,
          );
          setBlob([]);
          if (!res) {
            const toast = Toast.create({ message: 'Unable to process message, check internet connection', duration: 2000, color: 'toast-error' });
            toast.present();
            setShowProgressBar(false);
          } else {
            const toast = Toast.create({ message: 'Uploaded!', duration: 2000, color: 'toast-success' });
            toast.present();
            toast.dismiss();
            setLocationChecked(false);
            if (inputRef && inputRef.current) { inputRef.current.value = ""; }
            setPostClassName("");
            setPostClassNumber("");
            setPrevPostUploading(false);
            setShowProgressBar(false);
          }
        }
      } else {
        const notificationsToken = localStorage.getItem("notificationsToken") || "";
        const res = await addMessage(
          message,
          blob,
          uniqueId.toString(),
          position,
          schoolName,
          notificationsToken,
          checkboxSelection,
          postClassName,
          postClassNumber,
          docId,
        );
        if (!res) {
          const toast = Toast.create({ message: 'Unable to process message, check your internet connection', duration: 2000, color: 'toast-error' });
          toast.present();
          setShowProgressBar(false);
          setPrevPostUploading(false);
        } else {
          const toast = Toast.create({ message: 'Uploaded', duration: 2000, color: 'toast-success' });
          toast.present();
          toast.dismiss();
          setLocationChecked(false);
          if (inputRef && inputRef.current) { inputRef.current.value = ""; }
          setPostClassName("");
          setPostClassNumber("");
          setShowProgressBar(false);
          setPrevPostUploading(false);
        }
      }
    }
    console.log("message added");
  };

  /**
   * @description Handle the post button
   */
  const handleSendMessage = async () => {
    setLocationPinModal(false);
    setShowModal(false);
    setGifModal(false);
    // setGifs(null);
    messageAdd();
  };

  /**
   * @description Get the current location of the user
   */
  const getLocation = async () => {
    present({
      duration: 0,
      message: "Getting Location..."
    });
    try {
      const pos = await Geolocation.getCurrentPosition(locationOptions);
      setPosition(pos);
      const toast = Toast.create({ message: 'Location added to post', duration: 2000, color: 'toast-success' });
      toast.present();
      toast.dismiss();
      dismiss();
    } catch (e: any) {
      const toast = Toast.create({ message: 'Location access denied by user, adjust in iOS Settings', duration: 2000, color: 'toast-error' });
      toast.present();
      dismiss();
    }
    dismiss();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={() => {
        setLocationPinModal(false);
      }}
      breakpoints={[0, 0.99]}
      initialBreakpoint={0.99}
      handle={false}
    >
      <IonHeader translucent>
        <IonToolbar mode="ios">
          <IonTitle>Post</IonTitle>
          <IonButtons slot="start">
            <IonButton
              color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
              mode="ios"
              onClick={() => {
                setLocationPinModal(false);
              }}
            >
              Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonList inset lines="none">
        <IonRadioGroup value={checkboxSelection.charAt(0).toUpperCase() + checkboxSelection.slice(1)}>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="primary">General</IonLabel>
            <IonRadio slot="end" value="General" color="primary" onIonFocus={() => setCheckboxSelection("general")}></IonRadio>
          </IonItem>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="alert">Alert</IonLabel>
            <IonRadio color="alert" slot="end" value="Alert" onIonFocus={() => setCheckboxSelection("alert")}></IonRadio>
          </IonItem>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="sighting">Sighting</IonLabel>
            <IonRadio color="sighting" slot="end" value="Sighting" onIonFocus={() => setCheckboxSelection("sighting")}></IonRadio>
          </IonItem>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="buysell">Buy / Sell</IonLabel>
            <IonRadio color="buysell" slot="end" value="Buy/Sell" onIonFocus={() => setCheckboxSelection("buy/Sell")}></IonRadio>
          </IonItem>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="housing" >Housing</IonLabel>
            <IonRadio color="housing" slot="end" value="Housing" onIonFocus={() => setCheckboxSelection("housing")}></IonRadio>
          </IonItem>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="event" >Event</IonLabel>
            <IonRadio color="event" slot="end" value="Event" onIonFocus={() => setCheckboxSelection("event")}></IonRadio>
          </IonItem>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="dining" >Dining</IonLabel>
            <IonRadio color="dining" slot="end" value="Dining" onIonFocus={() => setCheckboxSelection("dining")}></IonRadio>
          </IonItem>
          <IonItem>
            <IonLabel style={{ fontSize: "1.1em" }} color="research">Research</IonLabel>
            <IonRadio color="research" slot="end" value="Research" onIonFocus={() => setCheckboxSelection("research")}></IonRadio>
          </IonItem>
        </IonRadioGroup>
      </IonList>

      <IonList inset={true} mode="ios">
        <IonItem mode="ios" lines="none">
          <IonLabel> Add pin to map?*</IonLabel><Map />
          <IonCheckbox
            slot="end"
            checked={locationChecked}
            onIonChange={(e) => {
              setLocationChecked(e.detail.checked);
              if (e.detail.checked) getLocation();
              else setPosition(null);
            }}
          />
        </IonItem>
      </IonList>

      <IonNote style={{ textAlign: "center" }}>*Location pin stays on map for up to two days</IonNote>
      <br />
      <div className="ion-button-container">
        <IonButton
          onClick={() => {
            handleSendMessage();
          }}
          className="login-button" fill="clear" expand="block"
          id="message"
          style={{ width: "75vw", fontSize : "1.25em" }}
        >
          Post
        </IonButton>
      </div>
    </IonModal>
  )
};