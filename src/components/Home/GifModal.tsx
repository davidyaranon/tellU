/* React + Ionic + Capacitor */
import React from "react";
import {
  IonButton, IonButtons, IonCol, IonContent, IonGrid,
  IonHeader, IonIcon, IonModal, IonRow, IonSearchbar, IonSpinner, IonTitle, IonToolbar
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { Keyboard } from "@capacitor/keyboard";
import { GalleryPhoto } from "@capacitor/camera";

/* Other imports */
import { useContext } from "../../my-context";
import { timeout } from "../../helpers/timeout";
import { useToast } from "@agney/ir-toast";
import FadeIn from "react-fade-in/lib/FadeIn";

function mapInSlices(array: any[], sliceSize: number, sliceFunc: any) {
  const out = [];
  for (var i = 0; i < array.length; i += sliceSize) {
    const slice = array.slice(i, i + sliceSize);
    out.push(sliceFunc(slice, i));
  }
  return out;
}

export const GifModal = (props: any) => {

  const schoolName = props.schoolName;
  const setPhotos = props.setPhotos;
  const setBlob = props.setBlob;
  const setShowModal = props.setShowModal;
  const setGifModal = props.setGifModal;
  const isOpen = props.isOpen;

  const Toast = useToast();
  const context = useContext();

  const gifSearchRef = React.useRef<HTMLIonSearchbarElement>(null);
  const [gifs, setGifs] = React.useState<any[] | null>(null);
  const [gifsLoading, setGifsLoading] = React.useState<boolean>(false);

  function httpGetAsync(theUrl: string, callback: any) {
    var xmlHttp = new XMLHttpRequest();
    let test;
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        test = callback(xmlHttp.responseText);
        return test;
      }
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
    return;
  }

  function tenorCallback_search(responsetext: string) {
    var response_objects = JSON.parse(responsetext);
    let gifs = response_objects["results"];
    console.log({ gifs });
    setGifsLoading(false);
    setGifs(gifs);
  }

  function grab_data(query: string, limit: number, tenorCallback_search: any) {
    var apikey = "AIzaSyBWtMQlnmYHdeJJtzNKYGw26MfRRByZ43w";
    var lmt = limit;
    var search_term = query;
    var search_url = "https://tenor.googleapis.com/v2/search?q=" + search_term + "&key=" +
      apikey + "&limit=" + lmt;
    httpGetAsync(search_url, tenorCallback_search);
    return;
  }

  const isEnterPressedGif = (key: string) => {
    if (key === "Enter") {
      Keyboard.hide();
      if (gifSearchRef && gifSearchRef.current) {
        const searchQuery: string | null | undefined = gifSearchRef.current.value;
        if (!searchQuery) {
          const toast = Toast.create({ message: 'Enter a search term', duration: 2000, color: 'toast-error' });
          toast.present();
          return;
        }
        setGifs(null);
        setGifsLoading(true);
        grab_data(searchQuery, 30, tenorCallback_search);
      } else {
        const toast = Toast.create({ message: 'Enter a search term', duration: 2000, color: 'toast-error' });
        toast.present();
      }
    }
  };


  return (
    <IonModal backdropDismiss={false} isOpen={isOpen} handle={false} breakpoints={[0, 1]} initialBreakpoint={1}>
      <div style={{ width: "100%" }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>GIF Search</IonTitle>
            <IonButtons style={{ marginLeft: "-2.5%" }}>
              <IonButton
                color={"primary"}
                onClick={() => {
                  Keyboard.hide().then(() => {
                    setTimeout(() => setGifModal(false), 100);
                  }).catch((err) => {
                    setTimeout(() => setGifModal(false), 100);
                  });
                  setGifs(null);
                }}
              >
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <br />
          <IonToolbar>
            <IonSearchbar color={context.darkMode ? "" : "light"} enterkeyhint="search" onKeyDown={e => isEnterPressedGif(e.key)} animated ref={gifSearchRef}></IonSearchbar>
          </IonToolbar>
        </IonHeader>
      </div>

      <IonContent>
        {gifs &&
          <IonGrid>
            {mapInSlices(gifs, 3, (slice: any[], index: number) => {
              return (
                <FadeIn key={index}>
                  <IonRow>
                    {slice.map((gif: any, index: number) => {
                      return (
                        <IonCol key={index}>
                          <img style={{ width: "200px", height: "125px" }} key={index.toString() + gif.id} src={gif.media_formats.tinygif.url}
                            onClick={async () => {
                              try {
                                const p: GalleryPhoto[] = [];
                                const blobsArr: any[] = [];
                                p.push({ webPath: gif.media_formats.tinygif.url, format: "gif" });
                                setPhotos(p);
                                let res = await fetch(p[0].webPath!);
                                let blobRes = await res.blob();
                                blobsArr.push(blobRes);
                                setBlob(blobsArr);
                                setShowModal(true);
                                await timeout(500);
                                setGifModal(false);
                              } catch (err: any) {
                                console.log(err);
                                const toast = Toast.create({ message: err.toString(), duration: 2000, color: 'toast-error' });
                                toast.present();
                              }
                            }}
                          />
                        </IonCol>
                      )
                    })}
                  </IonRow>
                </FadeIn>
              )
            })}
          </IonGrid>
        }
        {gifsLoading &&
          <div className="ion-spinner">
            <IonSpinner color={"primary"} />
          </div>
        }
        <br /> <br />
      </IonContent>
    </IonModal>
  )
}