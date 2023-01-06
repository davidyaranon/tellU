import { useToast } from "@agney/ir-toast";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";
import { IonToolbar, IonButtons, IonButton, IonIcon, IonAvatar, IonImg, IonHeader, useIonRouter, useIonLoading, IonTitle, IonText } from "@ionic/react";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage";
import { cameraReverseOutline, chatbubblesOutline, informationCircleOutline, notificationsOutline } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { getUserPhotoUrl, storage, uploadImage } from "../../fbConfig";
import { useContext } from "../../my-context";
import { dynamicNavigate } from "../Shared/Navigation";
import FadeIn from "react-fade-in/lib/FadeIn";

export const SettingsHeader = (props: any) => {
  const schoolName = props.schoolName;
  const logout = props.logout;
  const user = props.user;
  const editableUsername = props.editableUsername;

  const router = useIonRouter();
  const context = useContext();
  const Toast = useToast();
  const [present, dismiss] = useIonLoading();

  const [profilePhoto, setProfilePhoto] = useState<string>("");

  const handleSetProfilePhoto = useCallback(async () => {
    if (user) {
      if (user.photoURL) {
        setProfilePhoto(user.photoURL);
      } else {
        const u = await getUserPhotoUrl(user.uid);
        console.log(u);
        console.log("A")
        if (u) {
          setProfilePhoto(u);
          await Preferences.set({ key: "profilePhoto", value: u })
        }
      }
    }
  }, [user])


  const handleProfilePictureEdit = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      }).catch((err) => {
        const toast = Toast.create({ message: 'Picture not supported/something went wrong', duration: 2000, color: 'toast-error' });
        toast.present(); return;
      });
      if (!image) return;
      present({
        message: "Uploading...",
        duration: 0,
      });
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if (blobRes) {
        if (blobRes.size > 5_000_000) {
          // 5MB
          const toast = Toast.create({ message: 'Image size too big', duration: 2000, color: 'toast-error' });
          toast.present();
          dismiss();
        } else {
          uploadImage("profilePictures", blobRes, "photoURL").then(
            (hasUploaded) => {
              if (hasUploaded == false) {
                const toast = Toast.create({ message: 'Update failed, check your internet connection', duration: 2000, color: 'toast-error' });
                toast.present();
                dismiss();
              } else {
                if (user) {
                  getDownloadURL(
                    ref(storage, "profilePictures/" + user.uid + "photoURL")
                  ).then((url) => {
                    updateProfile(user, {
                      photoURL: url,
                    })
                      .then(() => {
                        setProfilePhoto(url);
                        const toast = Toast.create({ message: 'Photo uploaded', duration: 2000, color: 'toast-success' });
                        toast.present();
                        toast.dismiss();
                        localStorage.setItem("profilePhoto", JSON.stringify(url));
                        dismiss();
                      })
                      .catch((err) => {
                        const toast = Toast.create({ message: err.message.toString() || "", duration: 2000, color: 'toast-error' });
                        toast.present();
                        dismiss();
                      });
                  });
                } else {
                  const toast = Toast.create({ message: 'Unable to update profile image, try reloading the app', duration: 2000, color: 'toast-error' });
                  toast.present();
                  dismiss();
                }
              }
            }
          );
        }
      }
    } catch (err: any) {
      dismiss();
    }
  };

  useEffect(() => {
    handleSetProfilePhoto();
  }, [user])

  return (
    <>
      <IonToolbar mode="ios" style={{ height: "5vh" }}>
        <IonButtons slot="start">
          <IonButton
            onClick={logout}
            color="toast-error"
            mode="ios"
            fill="clear"
            id="logout"
          >
            Logout
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton
            color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
            onClick={() => {
              if (user) { dynamicNavigate(router, 'direct/' + schoolName + "/" + user.uid, "forward"); }
            }}
          >
            <IonIcon icon={chatbubblesOutline}>
            </IonIcon>
          </IonButton>
          <IonButton
            color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
            onClick={() => {
              dynamicNavigate(router, "notifications", "forward");
            }}
          >
            <IonIcon icon={notificationsOutline}></IonIcon>
          </IonButton>
          <IonButton
            color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}
            onClick={() => {
              dynamicNavigate(router, "privacy-policy", "forward");
            }}
          >
            <IonIcon icon={informationCircleOutline}></IonIcon>
          </IonButton>
        </IonButtons>
      </IonToolbar><IonHeader mode="ios" class="ion-no-border" style={{ textAlign: "center", }}>
        <IonAvatar className="user-avatar">
          <IonImg style={{ opacity: "80%" }} className="user-image" src={profilePhoto}></IonImg>
          <IonIcon size="large" icon={cameraReverseOutline} onClick={handleProfilePictureEdit}
            style={{ zIndex: "2", position: "absolute", margin: "auto", left: "54%", top: "0%" }} />
        </IonAvatar>
      </IonHeader>


      <FadeIn delay={500}>
        <p style={{ fontSize: "1.4em", textAlign: "center" }}>
          Hello
          <IonText color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"} onClick={() => { dynamicNavigate(router, 'about/' + schoolName + "/" + user.uid, 'forward'); }} >&nbsp;{editableUsername}</IonText>
        </p>
      </FadeIn>
    </>
  )
};