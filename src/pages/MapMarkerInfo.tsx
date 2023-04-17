/* Ionic + React + Capacitor */
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { IonPage, IonContent, IonNote, IonCard, IonCardTitle, IonChip, useIonViewWillEnter } from "@ionic/react";
import { Image as CapacitorImage, PhotoViewer as CapacitorPhotoViewer } from '@capacitor-community/photoviewer';
import { Camera, GalleryPhoto } from "@capacitor/camera";

/* Other Imports */
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Toolbar } from "../components/Shared/Toolbar";
import { markers } from "../helpers/maps-config";
import auth, { getLikes, getPOIPosts, getStorageUrl } from "../fbConfig";
import { HomePagePost } from "../components/Home/HomePagePost";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@agney/ir-toast";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Dialog } from "@capacitor/dialog";

interface MatchUserPostParams {
  school: string;
  title: string;
};

export const MapMarkerInfo = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  // props
  const schoolName = match.params.school;
  const markerTitle = match.params.title;

  // hooks 
  const [user, loading, error] = useAuthState(auth);
  const Toast = useToast();

  // state variables
  const [posts, setPosts] = useState<any>(null);
  const [description, setDescription] = useState<string[]>([""]);
  const [images, setImages] = useState<string[]>([]);
  const [chip, setChip] = useState<any[] | undefined>([]);
  const [clickable, setClickable] = useState<boolean>(false);

  // NOTE: both of these functions are not being used ATM
  const takePicture = async () => {
    return;
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
      
    } catch (err: any) {
      // Toast.error(err.message.toString());
    }
  };
  const handleUploadImage = async () => {
    return;
    if(!clickable) {
      return;
    }
    const {value} = await Dialog.confirm({
      title: 'Upload Image',
      message: 'Would you like to upload an image for this location?',
    });
    if(!value) {
      return;
    }
    takePicture(); 
  }

  const getInfo = useCallback(() => {
    for (let i = 0; i < markers.length; ++i) {
      if (markers[i].title === markerTitle) {
        setDescription(markers[i].description);
        setChip(markers[i].chip);
        setImages(markers[i].imgSrc);
        return;
      }
    }
  }, []);

  const getPosts = useCallback(async () => {
    let data: any = await getPOIPosts(markerTitle);
    if (data) {
      for (let i = 0; i < data.length; ++i) {
        const likesData = await getLikes(data[i].key);
        if (likesData) {
          data[i].likes = likesData.likes;
          data[i].dislikes = likesData.dislikes;
          data[i].commentAmount = likesData.commentAmount;
        }
        data[i].marker = false;
      }
      setPosts(data);
    } else {
      const toast = Toast.create({ message: 'Unable to load posts', duration: 2000, color: 'toast-error' });
      toast.present();
    }

  }, []);

  useEffect(() => {
    getInfo();
    getPosts();
  }, []);

  useIonViewWillEnter(() => {
    StatusBar.setStyle({ style: Style.Dark })
  });

  return (
    <IonPage>
      <Toolbar title={markerTitle} />
      <IonContent>
        <div style={{ height: "1vh" }} />
        {chip && chip.map(({ title, color, icon: Icon, local, image }, index: number) => {
          return (
            <IonChip outline color={color} key={index} onClick={async () => {
              if (image) {
                let url = "";
                if (!local) {
                  url = await getStorageUrl(image) || "";
                } else {
                  url = image;
                }
                const img: CapacitorImage = {
                  url: url,
                  title: markerTitle + title,
                };
                CapacitorPhotoViewer.show({
                  images: [img],
                  mode: 'one',
                  options: {
                    title: true
                  }
                });
              }
            }}>
              <Icon />
              <IonNote style={{ color: "var(--ion-color-" + color + ")", padding: "5px" }}>{title}</IonNote>
            </IonChip>
          )
        })}
        <div style={{ height: "2.5vh" }} />
        <Swiper
          pagination={{ dynamicBullets: true }}
          modules={[Pagination]}
          slidesPerView={1}
          onSlideChange={(e) => {
            return;
            if(images && images.length > 0) {
              let len = images.length;
              if(e.realIndex === len - 1) {
                setClickable(true);
              } else {
                setClickable(false);
              }
            }
          }}
        >
          {images.map((image: string, index: number) => {
            return (
              <SwiperSlide key={image + index.toString()} onClick={handleUploadImage}>
                <IonCard style={{ backgroundColor: "#0D1117" }}>
                  <img src={image} style={{ borderRadius: "10px" }} />
                </IonCard>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div style={{ padding: "10px", transform: "translateY(-5%)" }}>
          {description && description.map((desc, index: number) => {
            return (
              <p style={{ fontSize: "0.85em" }} key={index}>{desc}</p>
            )
          })}
        </div>
        <div style={{ textAlign: "center" }}>
          {posts && posts.length === 0 ?
            <>
              <IonCardTitle style={{ textAlign: "center", fontSize: "1.5em" }}>No {markerTitle} Posts Yet</IonCardTitle>
              <IonNote>Go there and make a post now!</IonNote>
            </>
            :
            <IonCardTitle style={{ textAlign: "center", fontSize: "1.5em" }}>Posts</IonCardTitle>
          }
          {!posts &&
            <>
              <br />
              <IonNote style={{ textAlign: "center" }}>Loading...</IonNote>
            </>
          }
        </div>

        {posts && posts.map((post: any, index: string) => {
          return (
            <div key={post.key}>
              <HomePagePost schoolName={schoolName} user={user} index={index} post={post} />
            </div>
          )
        })}
        <div style={{ height: "1vh" }} />
      </IonContent>
    </IonPage >
  )
};