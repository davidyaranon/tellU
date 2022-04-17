import { IonContent, IonHeader, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonCardTitle, IonCard, IonSlides, IonSlide,
  IonInfiniteScrollContent,  IonModal, IonImg, IonList, IonItem, IonLabel, IonTextarea, IonLoading, IonText, IonAvatar,
  IonInput, IonActionSheet, IonButton, IonIcon, IonRippleEffect, IonFab, IonFabButton, IonToolbar, IonTitle, IonButtons, IonSearchbar } 
from '@ionic/react';
import React, { useEffect, useState } from "react";
import { auth, db } from '../fbconfig'
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, collection, query, where, getDocs, } from "firebase/firestore";
import { serverTimestamp } from '@firebase/firestore'
import Header, { ionHeaderStyle } from './Header'
import '../App.css';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { Map, Marker, ZoomControl } from "pigeon-maps"
import { string } from 'prop-types';

const schoolInfo = {
  "UC Berkeley" : [37.87196553251828, -122.25832234237413, 15.5],
  "UC Davis" : [38.53906813693881, -121.7519863294826, 15],
  "UC Irvine" : [33.642798513829284, -117.83657521816043, 14.5],
  "UCLA" : [34.068060230062784, -118.4450963024167, 15.5],
  "UC Merced" : [37.362385, -120.427911, 15],
  "UC Riverside" : [33.972975051337265, -117.32790083366463, 16],
  "UC San Diego" : [32.8791284369769, -117.2368054903461, 15],
  "UCSF" : [37.76894651194302, -122.42952641954717, 13],
  "UC Santa Barbara" : [34.41302723872466, -119.84749752183016, 15],
  "UC Santa Cruz" : [36.994178678923895, -122.05892788857311, 15],
  "" : [37.250458, -120.350249, 6],
}


function Maps() {
  const schoolName = useSelector( (state: any) => state.user.school);
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [modeMode, setMoveMode] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [center, setCenter] = useState<[number, number]>([37.250458, -120.350249]);
  const [zoom, setZoom] = useState(6);
  const [markers, setMarkers] = useState<any[] | null>(null);
  const history = useHistory();
  const getSchoolLocation = () => {
    if(schoolInfo[schoolName as keyof typeof schoolInfo] !== undefined) {
      const latitude = schoolInfo[schoolName as keyof typeof schoolInfo][0];
      const longitude = schoolInfo[schoolName as keyof typeof schoolInfo][1];
      const schoolZoom = schoolInfo[schoolName as keyof typeof schoolInfo][2];
      setCenter([latitude, longitude]);
      setZoom(schoolZoom);
    }
  }
  const getMapMarkers = async () => {
    setBusy(true);
    const markersRef = collection(db, "mapMarkers");
    const todayTwelveAm = new Date();
    todayTwelveAm.setHours(0,0,0,0);
    const todayTwelvePm = new Date();
    todayTwelvePm.setHours(24,0,0,0);
    console.log(todayTwelveAm);
    console.log(todayTwelvePm);
    const q = query(markersRef, where("school", "==", schoolName), where("timestamp", ">", todayTwelveAm), where("timestamp", "<", todayTwelvePm));
    const querySnapshot = await getDocs(q);
    const tempMarkers : any[] = [];
    querySnapshot.forEach((doc) => {
      tempMarkers.push({
        data: doc.data(),
      })
    });
    setMarkers(tempMarkers);
    setBusy(false);
  }
  useEffect(() => {
    setBusy(true);
    if(!user) {
        history.replace("/landing-page");
    }
    else
    {
      getSchoolLocation();
      getMapMarkers();
      setBusy(false);
    }
  }, [user]);
  return (
    <React.Fragment>
      <IonContent fullscreen = {true}>
        <IonLoading message="Loading markers..." duration={0} isOpen={busy}></IonLoading>
        {/* <IonHeader class="ion-no-border" style={ionHeaderStyle}> */}
        <div className='overlaySearch'>
          <IonSearchbar color='light' mode='ios' placeholder="Search for dropped pins" inputMode='search' value={searchText} onIonChange={e => setSearchText(e.detail.value!)}></IonSearchbar>
        </div>
        
        {/* </IonHeader> */}

        <Map center={center} zoom={zoom} onBoundsChanged={({ center, zoom }) => { setCenter(center); setZoom(zoom); }}>
          <ZoomControl style={{top : "85vh"}} />
          {markers ? (
            markers.map((marker, index) =>{
              return <Marker color='red' key={index} anchor={[marker.data.location[0], marker.data.location[1]]} width={50} />
            })
          ) : (null)}
        </Map>

      </IonContent>
   </React.Fragment>
  );
}

export default React.memo(Maps);
