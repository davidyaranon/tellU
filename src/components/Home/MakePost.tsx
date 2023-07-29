import React from "react";
import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react";
import { useContext } from "../../my-context"
import GifIcon from '@mui/icons-material/Gif';
import { add, chatboxEllipsesOutline, statsChartOutline } from "ionicons/icons";
import { GalleryPhoto } from "@capacitor/camera";
import { GifModal } from "./GifModal";
import { PostModal } from "./PostModal";
import { PollModal } from "./PollModal";
import { LocationPinModal } from "./LocationPinModal";

export const MakePost = (props: any) => {

  const context = useContext();

  const schoolName = props.schoolName;
  const setShowProgressBar = props.handleSetShowProgressBar;
  const profilePhoto = props.profilePhoto;
  const user = props.user;

  const [photo, setPhoto] = React.useState<GalleryPhoto[] | null>([]);
  const [blob, setBlob] = React.useState<any | null>(null);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [showGifModal, setShowGifModal] = React.useState<boolean>(false);
  const [showPollModal, setShowPollModal] = React.useState<boolean>(false);
  const [postClassNumber, setPostClassNumber] = React.useState<string>("");
  const [postClassName, setPostClassName] = React.useState<string>("");
  const [prevPostUploading, setPrevPostUploading] = React.useState<boolean>(false);
  const [showLocationPinModal, setShowLocationPinModal] = React.useState<boolean>(false);

  const inputRef = React.useRef<HTMLIonTextareaElement>(null);

  /**
   * @description handles state update of location pin modal from child components
   * 
   * @param {boolean} show boolean to show or hide modal
   */
  const handleSetLocationPinModal = React.useCallback((show: boolean) => {
    setShowLocationPinModal(show);
  }, []);

  /**
   * @description handles state update of previous post uploading from child components
   * 
   * @param {boolean} loading boolean to show or hide progress bar
   */
  const handleSetPreviousPostLoading = React.useCallback((loading: boolean) => {
    setPrevPostUploading(loading);
  }, []);

  /**
   * @description handles state update of post class name from child components
   * 
   * @param {string} selection class name
   */
  const handleSetPostClassName = React.useCallback((selection: string) => {
    setPostClassName(selection);
  }, []);

  /**
   * @description handles state update of post class number from child components
   * 
   * @param {string} selection class number
   */
  const handleSetPostClassNumber = React.useCallback((selection: string) => {
    setPostClassNumber(selection);
  }, []);

  /**
   * @description handles state update of poll modal from child components
   * 
   * @param {boolean} show boolean to show or hide modal
   */
  const handleSetShowPollModal = React.useCallback((show: boolean) => {
    setShowPollModal(show);
  }, []);

  /**
   * @descroption handles state update of blob from child components
   * 
   * @param {any} blob photo data
   */
  const handleSetBlob = React.useCallback((blob: any) => {
    setBlob(blob);
  }, []);

  /**
   * @description handles state update of photos array from child components
   * 
   * @param {GalleryPhoto[]} photo array of photos
   */
  const handleSetPhotos = React.useCallback((photos: GalleryPhoto[]) => {
    setPhoto(photos);
  }, []);

  /**
   * @description handles state update of post modal from child components
   * 
   * @param {boolean} show boolean to show or hide modal
   */
  const handleSetGifModal = React.useCallback((show: boolean) => {
    setShowGifModal(show);
  }, []);

  /**
   * @description handles state update of gif modal from child components
   * 
   * @param {boolean} show boolean to show or hide modal
   */
  const handleSetShowModal = React.useCallback((show: boolean) => {
    setShowModal(show);
  }, []);

  return (
    <>
      <LocationPinModal
        isOpen={showLocationPinModal} setLocationPinModal={handleSetLocationPinModal}
        user={user} schoolName={schoolName}
        photos={photo} blob={blob} setPhoto={handleSetPhotos} setBlob={handleSetBlob}
        setShowModal={handleSetShowModal} setGifModal={handleSetGifModal}
        postClassName={postClassName} postClassNumber={postClassNumber} setPostClassName={handleSetPostClassName} setPostClassNumber={handleSetPostClassNumber}
        inputRef={inputRef} setShowProgressBar={setShowProgressBar} setPrevPostUploading={handleSetPreviousPostLoading} />

      <PostModal user={user} profilePhoto={profilePhoto} isOpen={showModal} schoolName={schoolName}
        postClassName={postClassName} setPostClassName={handleSetPostClassName} postClassNumber={postClassNumber} setPostClassNumber={handleSetPostClassNumber}
        photos={photo} setPhotos={handleSetPhotos} setBlob={handleSetBlob} inputRef={inputRef}
        setShowModal={handleSetShowModal} setGifModal={handleSetGifModal} setLocationPinModal={handleSetLocationPinModal} />

      <PollModal prevPostUploading={prevPostUploading} setShowProgressBar={setShowProgressBar}
        isOpen={showPollModal} user={user} schoolName={schoolName} setShowPollModal={handleSetShowPollModal} />

      <GifModal isOpen={showGifModal} schoolName={schoolName} setBlob={handleSetBlob} setPhotos={handleSetPhotos}
        setShowModal={handleSetShowModal} setGifModal={handleSetGifModal} />

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}>
          <IonIcon icon={add} />
        </IonFabButton>
        <IonFabList side="top">
          <IonFabButton onClick={() => { handleSetShowPollModal(true) }} color={context.schoolColorToggled ? "secondary" : "ion-blue"}>
            <IonIcon icon={statsChartOutline} />
          </IonFabButton>
          <IonFabButton onClick={() => { handleSetGifModal(true); }} color={context.schoolColorToggled ? "secondary" : "ion-blue"}>
            <GifIcon />
          </IonFabButton>
          <IonFabButton onClick={() => { handleSetShowModal(true); }} color={context.schoolColorToggled ? "secondary" : "ion-blue"}>
            <IonIcon icon={chatboxEllipsesOutline} />
          </IonFabButton>
        </IonFabList>
      </IonFab>
    </>
  )
}