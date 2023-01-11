import { IonPage, IonContent, IonCardContent, IonCard, IonCardTitle } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import { Toolbar } from "../components/Shared/Toolbar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import Canyon from '../images/canyon.jpeg';

import '../helpers/maps.css';
import "swiper/css";
import "swiper/css/pagination";
import { markers } from "../helpers/maps-config";

interface MatchUserPostParams {
  school: string;
  title: string;
}

export const MapMarkerInfo = ({ match }: RouteComponentProps<MatchUserPostParams>) => {
  const schoolName = match.params.school;
  const title = match.params.title;

  const [posts, setPosts] = useState<any[]>([]);
  const [description, setDescription] = useState<string>("");

  const getInfo = useCallback(() => {
    for (let i = 0; i < markers.length; ++i) {
      if (markers[i].title === title) {
        setDescription(markers[i].description);
      }
    }

  }, []);

  useEffect(() => {
    getInfo();
  }, [])

  return (
    <IonPage>
      <IonContent>
        <Toolbar schoolName={schoolName} title={title} />
        <IonCard className="ion-no-padding ion-no-border ion-no-margin">
          <IonCardTitle style={{fontSize : "1em", fontWeight : "lighter", padding : "10px"}}>
            <p>{description}</p>
          </IonCardTitle>
          <Swiper
            className="markerSwiper"
            pagination={{ dynamicBullets: false }}
            modules={[Pagination]}
            slidesPerView={1}
          >
            <SwiperSlide>
              <IonCard>
                <img src={Canyon} style={{ borderRadius: "10px" }} />
              </IonCard>
            </SwiperSlide>
            <SwiperSlide>
              <IonCard>
                <img src={Canyon} style={{ borderRadius: "10px" }} />
              </IonCard>
            </SwiperSlide>
          </Swiper>
        </IonCard>
      </IonContent>
    </IonPage>
  )
};