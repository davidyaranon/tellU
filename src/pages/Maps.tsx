/* React imports */
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";

/* Ionic/Capacitor */
import {
  IonContent, IonCardTitle, IonCard, IonLabel, IonButton, IonIcon,
  IonFab, IonCardContent, IonSelect, IonSelectOption, IonPage, useIonViewDidEnter,
  RouterDirection, useIonRouter, IonSpinner, useIonViewDidLeave, IonHeader,
} from "@ionic/react";
import { pencilOutline, schoolOutline } from "ionicons/icons";

/* Firebase */
import auth, { db } from "../fbconfig";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

/* CSS + Other components */
import "../App.css";
import { useToast } from "@agney/ir-toast";
import { getColor } from "../components/functions";
import { Map, Marker, ZoomControl, Overlay } from "pigeon-maps";
import schoolOutlineWhite from '../images/school-outline-white.png';
import pencilOutlineWhite from '../images/pencil-outline-white.png';


const zoomControlButtonsStyleDark = {
  width: "50px",
  height: '50px',
  borderRadius: '7.5px',
  boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
  background: '#2f2f2f',
  lineHeight: '26px',
  fontSize: '25PX',
  fontWeight: '700',
  color: 'WHITE',
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  outline: 'none',
  textIndent: '-7.5px',
}

const zoomControlButtonsStyle = {
  width: "50px",
  height: '50px',
  borderRadius: '7.5px',
  boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
  background: 'white',
  lineHeight: '26px',
  fontSize: '25PX',
  fontWeight: '700',
  color: 'BLACK',
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  outline: 'none',
  textIndent: '-7.5px',
}; // +/- buttons that appear on map can be styled here

const schoolInfo = {
  "Cal Poly Humboldt": [40.875130691835615, -124.07857275064532, 15.74],
  "UC Berkeley": [37.87196553251828, -122.25832234237413, 15.5],
  "UC Davis": [38.53906813693881, -121.7519863294826, 15],
  "UC Irvine": [33.642798513829284, -117.83657521816043, 14.5],
  "UCLA": [34.068060230062784, -118.4450963024167, 15.5],
  "UC Merced": [37.362385, -120.427911, 15],
  "UC Riverside": [33.972975051337265, -117.32790083366463, 16],
  "UC San Diego": [32.8791284369769, -117.2368054903461, 15],
  "UCSF": [37.76894651194302, -122.42952641954717, 13],
  "UC Santa Barbara": [34.41302723872466, -119.84749752183016, 15],
  "UC Santa Cruz": [36.994178678923895, -122.05892788857311, 15],
  "": [37.250458, -120.350249, 6],
}; // school latitude, longitude, and zoom level


function Maps() {
  const Toast = useToast();
  const history = useHistory();
  const router = useIonRouter();
  const schoolName = useSelector((state: any) => state.user.school);
  const darkModeToggled = useSelector((state: any) => state.darkMode.toggled);
  const schoolColorToggled = useSelector((state: any) => state.schoolColorPallete.colorToggled);

  // state variables
  const [user, loading, error] = useAuthState(auth);
  const [center, setCenter] = useState<[number, number]>([37.250458, -120.350249]);
  const [zoom, setZoom] = useState(6);
  const [defaultLat, setDefaultLat] = useState(0);
  const [defaultLong, setDefaultLong] = useState(0);
  const [defaultZoom, setDefaultZoom] = useState(0);
  const [markers, setMarkers] = useState<any[] | null>(null);
  const [markersCopy, setMarkersCopy] = useState<any[] | null>(null);
  const [overlayIndex, setOverlayIndex] = useState<number>(-1);
  const [markerFilter, setMarkerFilter] = useState<string>("ALL");
  const [pinsLoading, setPinsLoading] = useState<boolean>(false);
  const [selectOptions, setSelectOptions] = useState<any>({});
  const [editMode, setEditMode] = useState<boolean>(false);


  /**
   * routes to a given url and pushed it to the history stack
   * 
   * @param path {string} the url path being routed to 
   * @param direction {string} the type of animation being played during url navigation
   */
  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    const action = direction === "forward" ? "push" : "pop";
    router.push(path, direction, action);
  }

  /**
   * Sets the map to a default view based on school location
   */
  const setDefaultCenter = () => {
    setCenter([defaultLat, defaultLong]);
    setZoom(defaultZoom);
  };

  /**
   * gets school latitude and longitude based
   * on school name and sets map center/zoom
   * accordingly
   */
  const getSchoolLocation = () => {
    if (schoolInfo[schoolName as keyof typeof schoolInfo] !== undefined) {
      const latitude = schoolInfo[schoolName as keyof typeof schoolInfo][0];
      const longitude = schoolInfo[schoolName as keyof typeof schoolInfo][1];
      const schoolZoom = schoolInfo[schoolName as keyof typeof schoolInfo][2];
      let lat: string = localStorage.getItem("lat") || "";
      let long: string = localStorage.getItem("long") || "";
      if (lat !== "" && long !== "") {
        setCenter([parseFloat(lat), parseFloat(long)]);
        localStorage.removeItem("long");
        localStorage.removeItem("lat");
        setZoom(schoolZoom + 1);
      } else {
        setCenter([latitude, longitude]);
        setZoom(schoolZoom);
      }
      setDefaultLat(latitude);
      setDefaultLong(longitude);
      setDefaultZoom(schoolZoom);
    }
  };

  /**
   * sets map view to only show
   * certain markers based on a filter
   * chosen by the user
   * 
   * @param filter {string} the type of marker being displayed (GENERAL, BUY/SELL, ALERTS, SIGHTINGS, etc.)
   */
  const updateMarkers = (filter: string) => {
    setMarkerFilter(filter);
    if (filter === "ALL") {
      setMarkers(markersCopy);
    } else {
      if (filter == "YOURS") {
        let tempMarkers: any[] = [];
        if (markersCopy && user) {
          for (const marker of markersCopy) {
            if (marker.uid == user.uid) {
              tempMarkers.push(marker);
            }
          }
          setMarkers(tempMarkers);
        } else {
          Toast.error("Unable to filter :(");
        }
      } else {
        if (filter === "BUY/SELL") {
          filter = "buy/Sell";
        } else if (filter === "RESEARCH") {
          filter = "research";
        } else if (filter === "HOUSING") {
          filter = "housing"
        } else if (filter === "GENERAL") {
          filter = filter.toLowerCase();
        } else {
          filter = filter.toLowerCase();
          filter = filter.slice(0, -1);
        }
        let tempMarkers: any[] = [];
        if (markersCopy) {
          for (const marker of markersCopy) {
            if (marker.postType == filter) {
              tempMarkers.push(marker);
            }
          }
          setMarkers(tempMarkers);
        } else {
          Toast.error("Unable to filter :(");
        }
      }
    }
  };

  /**
   * Pulls info about a school's markers
   * from Firestore database, shows the most recent
   * 100 markers within the past 2 days
   */
  const getMapMarkers = async () => {
    if (schoolName) {
      const markersRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts"
      );
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      tomorrow.setDate(yesterday.getDate() + 2);
      const q = query(
        markersRef,
        where("marker", "==", true),
        where("timestamp", ">", yesterday),
        where("timestamp", "<", tomorrow),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const tempMarkers: any[] = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        tempMarkers.push({
          ...doc.data(),
          key: doc.id,
        });
      }
      setMarkers(tempMarkers);
      setMarkersCopy(tempMarkers);
      setPinsLoading(false);
    }
  };

  /**
   * Runs on page exit
   */
  useIonViewDidLeave(() => {
    setMarkerFilter("ALL");
    setEditMode(false);
  });

  /**
   * Runs on page enter
   * 
   * Sets center based on if pin was clicked on different page
   */
  useIonViewDidEnter(() => {
    if (!user) {
      history.replace("/landing-page");
    } else {
      let lat: string = localStorage.getItem("lat") || "";
      let long: string = localStorage.getItem("long") || "";
      if (lat !== "" && long !== "") {
        setCenter([parseFloat(lat), parseFloat(long)]);
        localStorage.removeItem("long");
        localStorage.removeItem("lat");
        setZoom(18.5);
      }
      getMapMarkers();
    }
  }, [user, schoolName]);


  useEffect(() => {
    if (schoolName === "Cal Poly Humboldt" && schoolColorToggled) {
      setSelectOptions({
        cssClass: 'my-custom-interface',
        header: 'Pin Filters',
        subHeader: 'Select which type of pin to display on the map'
      })
    } else {
      setSelectOptions({
        header: 'Pin Filters',
        subHeader: 'Select which type of pin to display on the map'
      })
    }
  }, [schoolColorToggled])

  /**
   * Runs on initial load
   * 
   * Grabs school location based on redux storage
   */
  useEffect(() => {
    if (!user) {
      history.replace("/landing-page");
    } else {
      setPinsLoading(true);
      getSchoolLocation();
    }
  }, [user, schoolName]);



  return (
    <IonPage>
      <IonContent fullscreen={true} className="no-scroll-content">
        {pinsLoading &&
          <IonFab horizontal="start" vertical="top">
            <IonSpinner name="lines"></IonSpinner>
          </IonFab>
        }
        {!editMode ?
          <div className={
            darkModeToggled && schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "overlaySearchDark"
              : darkModeToggled && schoolName === "Cal Poly Humboldt" && !schoolColorToggled ? "overlaySearchDarkNotHumboldt"
                : darkModeToggled && schoolName !== "Cal Poly Humboldt" ? "overlaySearchDarkNotHumboldt"
                  : !darkModeToggled && schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "overlaySearch"
                    : "overlaySearchNotHumboldt"
          }>
            <IonLabel color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}> FILTER: </IonLabel>
            <IonSelect
              interface="action-sheet"
              interfaceOptions={selectOptions}
              okText="Filter"
              cancelText="Cancel"
              mode="ios"
              value={markerFilter}
              placeholder="Filter: ALL"
              onIonChange={(e: any) => {
                setOverlayIndex(-1);
                updateMarkers(e.detail.value);
              }}
            >
              <IonSelectOption value="ALL" class="all-option">All</IonSelectOption>
              <IonSelectOption value="YOURS" class="your-option">Yours</IonSelectOption>
              <IonSelectOption value="GENERAL" className="general-option">General</IonSelectOption>
              <IonSelectOption value="ALERTS">Alerts</IonSelectOption>
              <IonSelectOption value="BUY/SELL">Buy/Sell</IonSelectOption>
              <IonSelectOption value="SIGHTINGS">Sightings</IonSelectOption>
              <IonSelectOption value="EVENTS">Events</IonSelectOption>
              <IonSelectOption value="RESEARCH">Research</IonSelectOption>
              <IonSelectOption value="HOUSING">Housing</IonSelectOption>
            </IonSelect>
          </div>
          :
          <div className={
            darkModeToggled && schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "overlaySearchDark"
              : darkModeToggled && schoolName === "Cal Poly Humboldt" && !schoolColorToggled ? "overlaySearchDarkNotHumboldt"
                : darkModeToggled && schoolName !== "Cal Poly Humboldt" ? "overlaySearchDarkNotHumboldt"
                  : !darkModeToggled && schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "overlaySearch"
                    : "overlaySearchNotHumboldt"
          }>
            <IonLabel color={schoolName === "Cal Poly Humboldt" && schoolColorToggled ? "tertiary" : "primary"}> ADD PIN TO MAP: </IonLabel>
            <IonSelect
              disabled={true}
              interface="action-sheet"
              interfaceOptions={selectOptions}
              okText="Filter"
              cancelText="Cancel"
              mode="ios"
              value={markerFilter}
            >
            </IonSelect>
          </div>
        }

        <Map
          center={center}
          zoom={zoom}
          animate={true}
          attributionPrefix={false}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          onClick={(e) => {
            if (editMode) {
              console.log(e.latLng);
            }
            setOverlayIndex(-1);
          }}
        >
          <ZoomControl style={{ left: "85%", top: "50%", opacity: "95%", zIndex: '100' }} buttonStyle={darkModeToggled ? zoomControlButtonsStyleDark : zoomControlButtonsStyle} />
          {markers && !editMode ? markers.map((marker, index) => {
            return (
              <Marker
                style={zoom > 17 ? { opacity: "80%" } : { opacity: "75%" }}
                color={getColor(marker.postType)}
                key={marker.key}
                anchor={[marker.location[0], marker.location[1]]}
                width={50}
                onClick={() => {
                  setCenter([
                    marker.location[0] - 0.0005,
                    marker.location[1],
                  ]);
                  setOverlayIndex(-1);
                  setOverlayIndex(index);
                }}
              />
            );
          })
            :
            markers && editMode ? markers.map((marker, index) => {
              return (
                <Marker
                  style={zoom > 17 ? { opacity: "35%" } : { opacity: "35%" }}
                  color={getColor(marker.postType)}
                  key={marker.key}
                  anchor={[marker.location[0], marker.location[1]]}
                  width={50}
                  onClick={() => {

                  }}
                />
              );
            })
              :
              null}
          {markers && overlayIndex != -1 && markers[overlayIndex] && "location" in markers[overlayIndex] ? (
            <Overlay
              anchor={[
                markers[overlayIndex].location[0],
                markers[overlayIndex].location[1],
              ]}
              offset={[110, 25]}
            >
              <IonCard
                onClick={() => { dynamicNavigate("post/" + markers[overlayIndex].key, "forward") }}
                style={{ width: "55vw", opacity: "90%" }}
                mode="ios"
              >
                <IonCardContent>
                  <IonCardTitle style={{ fontSize: "medium" }} mode="ios">
                    {markers[overlayIndex].userName}
                  </IonCardTitle>
                  <IonFab horizontal="end" vertical="top">
                    <p style={{ fontWeight: "bold", fontSize: "2.5vw", color: getColor(markers[overlayIndex].postType) }}>
                      {markers[overlayIndex].postType.toUpperCase()}
                    </p>
                  </IonFab>
                  <p>
                    {markers[overlayIndex].message.length > 120
                      ? markers[overlayIndex].message.substring(0, 120) + "..."
                      : markers[overlayIndex].message}
                  </p>
                  {markers[overlayIndex].imgSrc &&
                    markers[overlayIndex].imgSrc.length > 0 ? (
                    <>
                      <br></br>
                      <div
                        className="ion-img-container"
                        style={{ backgroundImage: `url(${markers[overlayIndex].imgSrc[0]})`, borderRadius: '10px' }}
                      >
                      </div>
                    </>
                  ) : null}
                </IonCardContent>
              </IonCard>
            </Overlay>
          ) : null}
          <IonFab horizontal="start" vertical="bottom" >
            <p style={schoolName === 'Cal Poly Humboldt' ? {
              fontSize: "1em", color: "#006F4D", fontWeight: "bold",
              textShadow: "#000 0px 0px 0.5px"
            } :
              { fontSize: "1em", color: "black", fontWeight: "bold" }}>{schoolName}</p>
          </IonFab>
          <IonFab horizontal="end" vertical="bottom">
            <IonButton color={darkModeToggled ? "dark" : "light"} onClick={setDefaultCenter} mode="ios">
              {darkModeToggled ?
                <img style={{ width: "20px" }} src={schoolOutlineWhite} />
                :
                <IonIcon icon={schoolOutline} />
              }
            </IonButton>
            {/* <IonButton color={darkModeToggled ? "dark" : "light"} mode="ios" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditMode((isEditable) => !isEditable) }}>
              {darkModeToggled ?
                <img style={{ width: "20px" }} src={pencilOutlineWhite} />
                :
                <IonIcon icon={pencilOutline} />
              }
            </IonButton> */}
          </IonFab>
        </Map>
      </IonContent>
    </IonPage>
  );
}

export default React.memo(Maps);
