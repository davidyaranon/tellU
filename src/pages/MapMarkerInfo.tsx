import { IonPage, IonContent, IonNote, IonCard, IonCardTitle, IonChip } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Image as CapacitorImage, PhotoViewer as CapacitorPhotoViewer } from '@capacitor-community/photoviewer';
import Canyon_Bathroom from '../images/canyon_bathroom.jpeg';

import { Toolbar } from "../components/Shared/Toolbar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import Canyon from '../images/canyon.jpeg';

import mapStyles from '../helpers/maps.module.css';
import "swiper/css";
import "swiper/css/pagination";
import { markers } from "../helpers/maps-config";
import auth, { getLikes, getPOIPosts, getStorageUrl } from "../fbConfig";
import { HomePagePost } from "../components/Home/HomePagePost";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@agney/ir-toast";

interface MatchUserPostParams {
  school: string;
  title: string;
};

export const MapMarkerInfo = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const schoolName = match.params.school;
  const markerTitle = match.params.title;

  const [user, loading, error] = useAuthState(auth);
  const Toast = useToast();

  const [posts, setPosts] = useState<any>(null);
  const [description, setDescription] = useState<string[]>([""]);
  const [chip, setChip] = useState<any[] | undefined>([]);

  const getInfo = useCallback(() => {
    for (let i = 0; i < markers.length; ++i) {
      if (markers[i].title === markerTitle) {
        setDescription(markers[i].description);
        setChip(markers[i].chip);
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

  }, [])

  useEffect(() => {
    getInfo();
    getPosts();
  }, []);

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

        <div style={{ padding: "10px" }}>
          {description && description.map((desc, index: number) => {
            return (
              <p style={{ fontSize: "0.85em" }} key={index}>{desc}</p>
            )
          })}
        </div>
        <Swiper
          pagination={{ dynamicBullets: true }}
          modules={[Pagination]}
          slidesPerView={1}
        >
          <SwiperSlide>
            <IonCard style={{ backgroundColor: "#0D1117" }}>
              <img src={Canyon} style={{ borderRadius: "10px" }} />
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <IonCard style={{ backgroundColor: "#0D1117" }}>
              <img src={Canyon} style={{ borderRadius: "10px" }} />
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <IonCard style={{ backgroundColor: "#0D1117" }}>
              <img src={Canyon} style={{ borderRadius: "10px" }} />
            </IonCard>
          </SwiperSlide>
          <SwiperSlide>
            <IonCard style={{ backgroundColor: "#0D1117" }}>
              <img src={Canyon} style={{ borderRadius: "10px" }} />
            </IonCard>
          </SwiperSlide>
        </Swiper>
        <div style={{ padding: "10px", textAlign: "center" }}>
          {posts && posts.length === 0 ?
            <>
              <IonCardTitle style={{ textAlign: "center", fontSize: "1.5em" }}>No {markerTitle} Posts Yet</IonCardTitle>
              <IonNote>Go there and make a post now!</IonNote>
            </>
            :
            <IonCardTitle style={{ textAlign: "center", fontSize: "1.5em" }}>Last 15 {markerTitle} Posts</IonCardTitle>
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