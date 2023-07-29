import React from "react";
import "../../App.css";
import { Image as CapacitorImage, PhotoViewer as CapacitorPhotoViewer } from '@capacitor-community/photoviewer';
import { useToast } from "@agney/ir-toast";
import { IonCol, IonRow } from "@ionic/react";
import { useContext } from "../../my-context";

const PostImages = (props: any) => {
  const imgSrc = props.imgSrc;
  const context = useContext();
  const sensitiveToggled = context.sensitivityToggled;
  const userName = props.userName;
  const reports = props.reports;
  const Toast = useToast();



  if (imgSrc && imgSrc.length == 1) {
    return (
      <>
        <div style={{ height: "0.75vh" }}>{" "}</div>
        <div
          className="ion-img-container-margin"
          style={sensitiveToggled && reports > 1 ? { borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${imgSrc[0]})`, borderRadius: '10px' }}
          onClick={(e) => {
            e.stopPropagation();
            const img: CapacitorImage = {
              url: imgSrc[0],
              title: `${userName}'s post`,
            };
            CapacitorPhotoViewer.show({
              images: [img],
              mode: 'one',
              options: {
                title: true
              }
            }).catch((err) => {
              const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
              toast.present();
            });
          }}
        >
        </div>
      </>
    );
  } else if (imgSrc && imgSrc.length == 2) {
    return (
      <>
        <div style={{ height: "0.75vh" }}>{" "}</div>
        <IonRow>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && reports > 1 ? { backgroundImage: `url(${imgSrc[0]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${imgSrc[0]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: imgSrc[0],
                    title: `${userName}'s post`
                  },
                  {
                    url: imgSrc[1],
                    title: `${userName}'s post`
                  },
                ]
                CapacitorPhotoViewer.show({
                  images: img,
                  mode: 'slider',
                  options: {
                    title: true,
                  },
                  startFrom: 0,
                }).catch((err) => {
                  const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                  toast.present();
                });
              }}
            >
            </div>
          </IonCol>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && reports > 1 ? { backgroundImage: `url(${imgSrc[1]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${imgSrc[1]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: imgSrc[0],
                    title: `${userName}'s post`
                  },
                  {
                    url: imgSrc[1],
                    title: `${userName}'s post`
                  },
                ]
                CapacitorPhotoViewer.show({
                  images: img,
                  mode: 'slider',
                  options: {
                    title: true
                  },
                  startFrom: 1,
                }).catch((err) => {
                  const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                  toast.present();
                });
              }}
            >
            </div>
          </IonCol>
        </IonRow>
      </>
    )
  } else if (imgSrc && imgSrc.length >= 3) {
    return (
      <>
        <div style={{ height: "0.75vh", }}>{" "}</div>
        <IonRow>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && reports > 1 ? { backgroundImage: `url(${imgSrc[0]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${imgSrc[0]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: imgSrc[0],
                    title: `${userName}'s post`
                  },
                  {
                    url: imgSrc[1],
                    title: `${userName}'s post`
                  },
                  {
                    url: imgSrc[2],
                    title: `${userName}'s post`
                  },
                ]
                CapacitorPhotoViewer.show({
                  images: img,
                  mode: 'slider',
                  options: {
                    title: true
                  },
                  startFrom: 0,
                }).catch((err) => {
                  const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                  toast.present();
                });
              }}
            >
            </div>
          </IonCol>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && reports > 1 ? { backgroundImage: `url(${imgSrc[1]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${imgSrc[1]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: imgSrc[0],
                    title: `${userName}'s post`
                  },
                  {
                    url: imgSrc[1],
                    title: `${userName}'s post`
                  },
                  {
                    url: imgSrc[2],
                    title: `${userName}'s post`
                  },
                ]
                CapacitorPhotoViewer.show({
                  images: img,
                  mode: 'slider',
                  options: {
                    title: true
                  },
                  startFrom: 1,
                }).catch((err) => {
                  const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                  toast.present();
                });
              }}
            >
            </div>
          </IonCol>
        </IonRow>
        <>
          <div style={{ height: "0.75vh", }}>{" "}</div>
          <div
            className="ion-img-container-margin"
            style={sensitiveToggled && reports > 1 ? { backgroundImage: `url(${imgSrc[2]})`, borderRadius: '20px', filter: "blur(0.25em)" } : { backgroundImage: `url(${imgSrc[2]})`, borderRadius: '20px' }}
            onClick={(e) => {
              e.stopPropagation();
              const img: CapacitorImage[] = [
                {
                  url: imgSrc[0],
                  title: `${userName}'s post`
                },
                {
                  url: imgSrc[1],
                  title: `${userName}'s post`
                },
                {
                  url: imgSrc[2],
                  title: `${userName}'s post`
                },
              ]
              CapacitorPhotoViewer.show({
                images: img,
                mode: 'slider',
                options: {
                  title: true
                },
                startFrom: 2,
              }).catch((err) => {
                const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                toast.present();
              });
            }}
          >
          </div>
        </>
      </>
    )
  }
  return <></>
}

export default React.memo(PostImages);