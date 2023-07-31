/* Ionic/React + Capacitor */
import {
  IonButton, IonButtons, IonCheckbox, IonHeader,
  IonItem, IonLabel, IonList, IonModal, IonNote, IonRadio, IonRadioGroup, IonTitle, IonToolbar, useIonLoading, useIonToast
} from "@ionic/react";
import { useState } from "react";
import { Geolocation, GeolocationOptions, Geoposition } from "@awesome-cordova-plugins/geolocation";

/* Firebase/Google */
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addMessage, storage, updateAchievements } from "../../fbConfig";

/* Other Components */
import { v4 as uuidv4 } from "uuid";
import Map from "@mui/icons-material/Map";
import { useToast } from "@agney/ir-toast";
import { useContext } from "../../my-context";
import { davisPOIs, humboldtPOIs } from "../../helpers/maps-config";
import { Preferences } from "@capacitor/preferences";
import { useHistory } from "react-router";
import { serverTimestamp, Timestamp } from "firebase/firestore";

/* options for getting user's location using {@awesome-cordova-plugins/geolocation} */
const locationOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000
};

function area(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
  return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
}

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
  const history = useHistory();
  const [present, dismiss] = useIonLoading();
  const [presentToast] = useIonToast();

  /* state variables */
  const [locationChecked, setLocationChecked] = useState<boolean>(false);
  const [position, setPosition] = useState<Geoposition | null>();
  const [POI, setPOI] = useState<string>("");
  const [checkboxSelection, setCheckboxSelection] = useState<string>("general");

  const presentAchievement = async (achievement: string): Promise<void> => {
    const achStr = achievement.replace(/\s+/g, '');
    await Preferences.set({ "key": achStr, value: "true" });
    presentToast({
      message: 'You just unlocked the ' + achievement + ' achievement!',
      duration: 3500,
      position: 'top',
      buttons: [
        {
          text: 'Open',
          role: 'info',
          handler: () => { history.push('/achievements'); }
        },
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => { }
        }
      ],
      cssClass: 'toast-options',
    });
  }

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
          if (blob.length >= 3) {
            const pictureThisAchievement = await Preferences.get({ key: "PictureThis" });
            if ((!pictureThisAchievement) || pictureThisAchievement.value !== 'true') {
              await updateAchievements('Picture This');
              await presentAchievement('Picture This');
            }
          }
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
            POI,
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
            const classActAchievement = await Preferences.get({ key: "ClassAct" });
            if (!classActAchievement || (classActAchievement.value !== 'true')) {
              if (postClassName && postClassName.length > 0) {
                await updateAchievements('Class Act');
                await presentAchievement('Class Act');
              }
            }

            const foodieAchievement = await Preferences.get({ key: "Foodie" });
            if ((!foodieAchievement) || foodieAchievement.value !== 'true') {
              if (checkboxSelection === 'dining') {
                await updateAchievements('Foodie');
                await presentAchievement('Foodie');
              }
            }

            const partyStarterAchievement = await Preferences.get({ key: "PartyStarter" });
            if ((!partyStarterAchievement) || partyStarterAchievement.value !== 'true') {
              if (checkboxSelection === 'event') {
                await updateAchievements('Party Starter');
                await presentAchievement('Party Starter');
              }
            }

            const nightOwlAchievement = await Preferences.get({ key: "NightOwl" });
            if ((!nightOwlAchievement) || nightOwlAchievement.value !== "true") {
              const serverDate: Date = Timestamp.now().toDate();
              const createdAtHourPST: number = (serverDate.getUTCHours() + 8) % 24;
              const isBetween12And4 = createdAtHourPST >= 0 && createdAtHourPST < 4;
              if (isBetween12And4) {
                await updateAchievements("Night Owl");
                await presentAchievement("Night Owl");
              }
            }

            if (position) {
              const backpackerAchievement = await Preferences.get({ key: "Backpacker" });
              if ((!backpackerAchievement) || backpackerAchievement.value !== "true") {
                await updateAchievements("Backpacker");
                await presentAchievement("Backpacker");
              }
            }

            setPosition(null); setPOI('');
          }
        }
      } else {
        const notificationsToken = localStorage.getItem("notificationsToken") || "";
        const res = await addMessage(
          message,
          blob,
          uniqueId.toString(),
          position,
          POI,
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
          const classActAchievement = await Preferences.get({ key: "ClassAct" });
          if (!classActAchievement || (classActAchievement.value !== 'true')) {
            if (postClassName && postClassName.length > 0) {
              await updateAchievements('Class Act');
              await presentAchievement('Class Act');
            }
          }

          const foodieAchievement = await Preferences.get({ key: "Foodie" });
          if ((!foodieAchievement) || foodieAchievement.value !== 'true') {
            if (checkboxSelection === 'dining') {
              await updateAchievements('Foodie');
              await presentAchievement('Foodie');
            }
          }

          const partyStarterAchievement = await Preferences.get({ key: "PartyStarter" });
          if ((!partyStarterAchievement) || partyStarterAchievement.value !== 'true') {
            if (checkboxSelection === 'event') {
              await updateAchievements('Party Starter');
              await presentAchievement('Party Starter');
            }
          }

          const nightOwlAchievement = await Preferences.get({ key: "NightOwl" });
          if ((!nightOwlAchievement) || nightOwlAchievement.value !== "true") {
            const serverDate: Date = Timestamp.now().toDate();
            const createdAtHourPST: number = (serverDate.getUTCHours() + 8) % 24;
            const isBetween12And4 = createdAtHourPST >= 0 && createdAtHourPST < 4;
            if (isBetween12And4) {
              await updateAchievements("Night Owl");
              await presentAchievement("Night Owl");
            }
          }

          if (position) {
            const backpackerAchievement = await Preferences.get({ key: "Backpacker" });
            if ((!backpackerAchievement) || backpackerAchievement.value !== "true") {
              await updateAchievements("Backpacker");
              await presentAchievement("Backpacker");
            }
          }

          setPosition(null); setPOI('');
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
   * @description sees if the user is currently in a POI based on their location
   * 
   * @param {number} lat the latitude of the user's current position
   * @param {number} long the longitude of the user's current position
   */
  const checkPOI = (lat: number, long: number) => {
    let poiToCheck = schoolName === "UC Davis" ? davisPOIs : humboldtPOIs;
    for (const [key, value] of Object.entries(poiToCheck)) {
      const arr: number[] = value;
      const A = area(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]) +
        area(arr[0], arr[1], arr[6], arr[7], arr[4], arr[5]);
      const A1 = area(lat, long, arr[0], arr[1], arr[2], arr[3]);
      const A2 = area(lat, long, arr[2], arr[3], arr[4], arr[5]);
      const A3 = area(lat, long, arr[4], arr[5], arr[6], arr[7]);
      const A4 = area(lat, long, arr[0], arr[1], arr[6], arr[7]);
      if (Math.abs(A - (A1 + A2 + A3 + A4)) < 0.0000000000000001) {
        console.log("Post is in POI: " + key);
        return key;
      }
    }
    return "";
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
      console.log({ pos })
      const poi: string = checkPOI(pos.coords.latitude, pos.coords.longitude);
      if ((poi === "") || (!poi) || (poi.length < 0)) {
        const toast = Toast.create({ message: 'Looks like you are not near a pinned location!', duration: 2000, color: 'toast-error' });
        toast.present();
        dismiss();
        return;
      }
      setPOI(poi.trim());
      setPosition(pos);
      const toast = Toast.create({ message: 'Location: ' + poi + ' added!', duration: 2000, color: 'toast-success' });
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
              color={"primary"}
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
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='general-radio' style={{ fontSize: "1.1em" }} color="general">General</IonLabel>
            <IonRadio aria-labelledby='general-radio' slot="end" value="General" color="general" onIonFocus={() => setCheckboxSelection("general")}></IonRadio>
          </IonItem>
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='alert-radio' style={{ fontSize: "1.1em" }} color="alert">Alert</IonLabel>
            <IonRadio aria-labelledby="alert-radio" color="alert" slot="end" value="Alert" onIonFocus={() => setCheckboxSelection("alert")}></IonRadio>
          </IonItem>
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='sighting-radio' style={{ fontSize: "1.1em" }} color="sighting">Sighting</IonLabel>
            <IonRadio aria-labelledby="sighting-radio" color="sighting" slot="end" value="Sighting" onIonFocus={() => setCheckboxSelection("sighting")}></IonRadio>
          </IonItem>
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='buysell-radio' style={{ fontSize: "1.1em" }} color="buysell">Buy / Sell</IonLabel>
            <IonRadio aria-labelledby="buysell-radio" color="buysell" slot="end" value="Buy/Sell" onIonFocus={() => setCheckboxSelection("buy/Sell")}></IonRadio>
          </IonItem>
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='housing-radio' style={{ fontSize: "1.1em" }} color="housing" >Housing</IonLabel>
            <IonRadio aria-labelledby="housing-radio" color="housing" slot="end" value="Housing" onIonFocus={() => setCheckboxSelection("housing")}></IonRadio>
          </IonItem>
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='event-radio' style={{ fontSize: "1.1em" }} color="event" >Event</IonLabel>
            <IonRadio aria-labelledby="event-radio" color="event" slot="end" value="Event" onIonFocus={() => setCheckboxSelection("event")}></IonRadio>
          </IonItem>
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='research-radio' style={{ fontSize: "1.1em" }} color="research">Research</IonLabel>
            <IonRadio aria-labelledby="research-radio" color="research" slot="end" value="Research" onIonFocus={() => setCheckboxSelection("research")}></IonRadio>
          </IonItem>
          <IonItem style={{ '--min-height': '1vh' }}>
            <IonLabel id='dining-radio' style={{ fontSize: "1.1em" }} color="dining" >Dining</IonLabel>
            <IonRadio aria-labelledby="dining-radio" color="dining" slot="end" value="Dining" onIonFocus={() => setCheckboxSelection("dining")}></IonRadio>
          </IonItem>
        </IonRadioGroup>
      </IonList>

      <IonList inset={true} mode="ios">
        <IonItem mode="ios" lines="none">
          {POI.length > 0 ?
            <IonLabel> Add post to map? </IonLabel>
            :
            <IonLabel> Add post to map?*</IonLabel>
          }
          <Map />
          <IonCheckbox
            slot="end"
            checked={locationChecked}
            onIonChange={(e) => {
              setLocationChecked(e.detail.checked);
              if (e.detail.checked) { getLocation(); }
              else { setPosition(null); setPOI(''); }
            }}
          />
        </IonItem>
      </IonList>

      {POI.length > 0 && locationChecked ?
        <IonNote style={{ textAlign: "center" }}>Location: {POI}</IonNote>
        :
        <IonNote style={{ textAlign: "center" }}>*Will add your post to the map pin corresponding to your location on campus</IonNote>
      }

      <br />
      <div className="ion-button-container">
        <IonButton
          onClick={() => {
            handleSendMessage();
          }}
          className={context.schoolColorToggled ? "location-post-button-humboldt" : "login-button"} fill="clear" expand="block"
          id="message"
          style={{ width: "75vw", fontSize: "1.25em", marginBottom: "10px" }}
        >
          Post
        </IonButton>
      </div>
    </IonModal>
  )
};