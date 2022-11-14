import React from "react";
import "../App.css";
import { Image as CapacitorImage, PhotoViewer as CapacitorPhotoViewer } from '@capacitor-community/photoviewer';
import { useToast } from "@agney/ir-toast";
import { IonCol, IonRow } from "@ionic/react";

const PostImages = (props: any) => {
  const post = props.post;
  const sensitiveToggled = props.isSensitive;
  const Toast = useToast();

  if ("imgSrc" in post && post.imgSrc && post.imgSrc.length == 1) {
    return (
      <>
        <div style={{ height: "0.75vh" }}>{" "}</div>
        <div
          className="ion-img-container"
          style={sensitiveToggled && "reports" in post && post.reports > 1 ? { borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius : '10px'}}
          onClick={(e) => {
            e.stopPropagation();
            const img: CapacitorImage = {
              url: post.imgSrc[0],
              title: `${post.userName}'s post`,
            };
            CapacitorPhotoViewer.show({
              images: [img],
              mode: 'one',
              options: {
                title: true
              }
            }).catch((err) => {
              Toast.error('Unable to open image on web version');
            });
          }}
        >
        </div>
      </>
    );
  } else if ("imgSrc" in post && post.imgSrc && post.imgSrc.length == 2) {
    return (
      <>
        <div style={{ height: "0.75vh" }}>{" "}</div>
        <IonRow>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: post.imgSrc[0],
                    title: `${post.userName}'s post`
                  },
                  {
                    url: post.imgSrc[1],
                    title: `${post.userName}'s post`
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
                  Toast.error('Unable to open image on web version');
                });
              }}
            >
            </div>
          </IonCol>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: post.imgSrc[0],
                    title: `${post.userName}'s post`
                  },
                  {
                    url: post.imgSrc[1],
                    title: `${post.userName}'s post`
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
                  Toast.error('Unable to open image on web version');
                });
              }}
            >
            </div>
          </IonCol>
        </IonRow>
      </>
    )
  } else if ("imgSrc" in post && post.imgSrc && post.imgSrc.length >= 3) {
    return (
      <>
        <div style={{ height: "0.75vh", }}>{" "}</div>
        <IonRow>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[0]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: post.imgSrc[0],
                    title: `${post.userName}'s post`
                  },
                  {
                    url: post.imgSrc[1],
                    title: `${post.userName}'s post`
                  },
                  {
                    url: post.imgSrc[2],
                    title: `${post.userName}'s post`
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
                  Toast.error('Unable to open image on web version');
                });
              }}
            >
            </div>
          </IonCol>
          <IonCol>
            <div
              className="ion-img-container"
              style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[1]})`, borderRadius: '10px' }}
              onClick={(e) => {
                e.stopPropagation();
                const img: CapacitorImage[] = [
                  {
                    url: post.imgSrc[0],
                    title: `${post.userName}'s post`
                  },
                  {
                    url: post.imgSrc[1],
                    title: `${post.userName}'s post`
                  },
                  {
                    url: post.imgSrc[2],
                    title: `${post.userName}'s post`
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
                  Toast.error('Unable to open image on web version');
                });
              }}
            >
            </div>
          </IonCol>
        </IonRow>
        <>
          <div style={{ height: "0.75vh", }}>{" "}</div>
          <div
            className="ion-img-container"
            style={sensitiveToggled && "reports" in post && post.reports > 1 ? { backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '20px', filter: "blur(0.25em)" } : { backgroundImage: `url(${post.imgSrc[2]})`, borderRadius: '20px' }}
            onClick={(e) => {
              e.stopPropagation();
              const img: CapacitorImage[] = [
                {
                  url: post.imgSrc[0],
                  title: `${post.userName}'s post`
                },
                {
                  url: post.imgSrc[1],
                  title: `${post.userName}'s post`
                },
                {
                  url: post.imgSrc[2],
                  title: `${post.userName}'s post`
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
                Toast.error('Unable to open image on web version');
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