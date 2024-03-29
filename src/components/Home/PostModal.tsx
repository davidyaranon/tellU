/* React + Ionic + Capacitor */
import {
  IonAvatar,
  IonButton, IonButtons, IonCard, IonCol, IonContent, IonFab,
  IonIcon, IonImg, IonModal, IonRow, IonTextarea, IonToolbar
} from "@ionic/react";
import { Keyboard } from "@capacitor/keyboard";
import { Camera, GalleryPhoto } from "@capacitor/camera";
import { cameraOutline, closeOutline } from "ionicons/icons";

/* Other imports */
import { useContext } from "../../my-context";
import { ClassSelections } from "./ClassSelections";
import FadeIn from "react-fade-in/lib/FadeIn";

export const PostModal = (props: any) => {

  const photos = props.photos;
  const profilePhoto = props.profilePhoto;
  const setPhotos = props.setPhotos;
  const setBlob = props.setBlob;
  const setShowModal = props.setShowModal;
  const setGifModal = props.setGifModal;
  const isOpen = props.isOpen;
  const prevPostUploading = props.prevPostUploading;
  const postClassName = props.postClassName;
  const postClassNumber = props.postClassNumber;
  const setPostClassName = props.setPostClassName;
  const setPostClassNumber = props.setPostClassNumber;
  const schoolName = props.schoolName;
  const inputRef = props.inputRef;
  const setLocationPinModal = props.setLocationPinModal;

  const context = useContext();

  const takePicture = async () => {
    try {
      const images = await Camera.pickImages({
        quality: 50,
        limit: 3,
      });
      let blobsArr: any[] = [];
      let photoArr: GalleryPhoto[] = [];
      for (let i = 0; i < images.photos.length; ++i) {
        let res = await fetch(images.photos[i].webPath!);
        let blobRes = await res.blob();
        blobsArr.push(blobRes);
        photoArr.push(images.photos[i]);
      }
      setPhotos(photoArr);
      setBlob(blobsArr);
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  };

  return (
    <IonModal canDismiss={!isOpen} backdropDismiss={false} isOpen={isOpen} mode='ios' handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
      <div style={{ width: "100%" }}>
        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonButton
              color={"primary"}
              mode="ios"
              onClick={() => {
                setPhotos([]);
                setBlob([]);
                setPostClassName("");
                setPostClassNumber("");
                setGifModal(false);
                // handleSetGifs(null);
                Keyboard.hide().then(() => {
                  setTimeout(() => setShowModal(false), 100)
                }).catch((err) => {
                  setTimeout(() => setShowModal(false), 100)
                });
              }}
            >
              Close
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              color="light"
              onClick={() => {
                setLocationPinModal(true);
              }}
              className={"post-button"}
              fill="clear"
              expand="block"
              id="message"
              disabled={prevPostUploading}
            >
              Post
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </div>
      <IonContent>

        <IonCard>
          <IonRow class="ion-padding-top">
            {profilePhoto ? (
              <>
                <IonCol size="2.75" style={{ paddingRight: "10px", paddingTop: "10px" }}>
                  <IonAvatar style={{ marginLeft: "15%" }}>
                    <img src={profilePhoto} />
                  </IonAvatar>
                </IonCol>
                <IonCol>
                  <IonTextarea
                    aria-label=""
                    spellcheck={true}
                    ref={inputRef}
                    rows={3}
                    maxlength={500}
                    style={context.darkMode ? { color: "white", height: "80px", fontSize: "large", paddingLeft: '5px', paddingRight: '15px' } : { color: "black", height: "80px", fontSize: "large", paddingLeft: '5px', paddingRight: '15px' }}
                    disabled={prevPostUploading}
                    placeholder="Start typing..."
                    id="message"
                  ></IonTextarea>
                </IonCol>
              </>
            )
              : (
                <>
                  <IonTextarea
                    aria-label=""
                    spellcheck={true}
                    ref={inputRef}
                    rows={3}
                    maxlength={500}
                    style={context.darkMode ? { color: "white", height: "80px", fontSize: "large", paddingLeft: '5px', paddingRight: '15px' } : { color: "black", height: "80px", fontSize: "large", paddingLeft: '5px', paddingRight: '15px' }}
                    disabled={prevPostUploading}
                    placeholder="Start typing..."
                    id="message"
                  ></IonTextarea>
                </>
              )}
          </IonRow>
          <br /> <br />
          <IonRow>

            <ClassSelections setPostClassName={setPostClassName} setPostClassNumber={setPostClassNumber} schoolName={schoolName} postClassNumber={postClassNumber} postClassName={postClassName} />

            <IonFab horizontal="end" style={{
              textAlign: "center", alignItems: "center",
              alignSelf: "center", display: "flex", paddingTop: ""
            }}>
              <IonButton
                fill="clear"
                onClick={takePicture}
                color={context.darkMode ? "light" : "dark"}
                disabled={prevPostUploading}
              >
                <IonIcon icon={cameraOutline} />
              </IonButton>
            </IonFab>
          </IonRow>

          {photos && photos.length > 0 ? (
            <>
              <br />
              <FadeIn>
                {photos.map((photo: GalleryPhoto, index: number) => {
                  return (
                    <IonCard key={"photo_" + index.toString()}>
                      <IonImg src={photo?.webPath} />
                    </IonCard>
                  )
                })}
              </FadeIn>
            </>
          ) : <> <br></br><br></br> </>}

        </IonCard>
        {prevPostUploading && <p style={{ textAlign: "center" }}>Wait until previous post has <br />uploaded to post again</p>}
      </IonContent>
    </IonModal>
  )
}