/* React imports */
import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";

/* Ionic/Capacitor */
import {
  IonContent, IonCardTitle, IonCard, IonButton, IonIcon,
  IonFab, IonCardContent, IonSelect, IonSelectOption, IonPage, useIonViewDidEnter,
  RouterDirection, useIonViewWillEnter, IonText
} from "@ionic/react";
import { schoolOutline } from "ionicons/icons";

/* Firebase */
import auth from "../fbConfig";

/* CSS + Other components */
import "../App.css";
import { useToast } from "@agney/ir-toast";
import { MapMarker, mapTiler, markers, schoolInfo, zoomControlButtonsStyle, zoomControlButtonsStyleDark } from "../helpers/maps-config";
import { Map, Marker, ZoomControl, Overlay } from "pigeon-maps";
import schoolOutlineWhite from '../images/school-outline-white.png';
import { useContext } from "../my-context";
import { Preferences } from "@capacitor/preferences";
// import locations from '../locations';
// import buildings from '../locations';

const getIonColor = (color: string) => {
  let c: string = "";
  for (let i = color.length - 2; i >= 0; --i) {
    if (color[i] === '-') {
      return c.split('').reverse().join('');
    }
    c += color[i];
  }
  return c.split('').reverse().join('');
};

const selectOptions = {
  header: 'Pin Filters',
  subHeader: 'Select which type of pin to display on the map'
};

// function parseXml(xml: string): void {
//   return;
//   const parser = new DOMParser();
//   const xmlDoc = parser.parseFromString(xml, "text/xml");

//   const markers: MapMarker[] = [];

//   const categories = xmlDoc.getElementsByTagName("category");
//   for (let i = 0; i < categories.length; i++) {
//     const category = categories[i];
//     const categoryType = category.getAttribute("type");
//     if (categoryType === "SR" || categoryType === "HD") {
//       const subcategories = category.getElementsByTagName("subcategory");
//       for (let j = 0; j < subcategories.length; j++) {
//         const subcategory = subcategories[j];
//         const locations = subcategory.getElementsByTagName("location");
//         for (let k = 0; k < locations.length; k++) {
//           const location = locations[k];
//           let title = location.getAttribute("name") || "";
//           title = decodeURIComponent(title.replace(/\+/g, ' '));
//           const description = location.getAttribute("description") || "";
//           const tab1 = location.getAttribute("tab1") || "";
//           const marker: MapMarker = {
//             location: [parseFloat(location.getAttribute("lat") || "0"), parseFloat(location.getAttribute("lng") || "0")],
//             title: title,
//             imgSrc: [""],
//             description: [description, tab1],
//             tag: subcategory.getAttribute("name") || "",
//             color: "",
//             chip: [],
//           };
//           markers.push(marker);
//         }
//       }
//     }
//   }

//   const markerStr = JSON.stringify(markers, null, 2);

//   console.log(`export const markers = ${markerStr};`);
// }

// function parseXml(xml: string): void {
//   const parser = new DOMParser();
//   const xmlDoc = parser.parseFromString(xml, "text/xml");

//   const markers: MapMarker[] = [];

//   const buildings = xmlDoc.getElementsByTagName("building");
//   for(let i = 0; i < buildings.length; i++) {
//     const building = buildings[i];
//     let title = building.getAttribute("name") || "";
//     title = decodeURIComponent(title.replace(/\+/g, ' '));
//     const marker: MapMarker = {
//       location: [parseFloat(building.getAttribute("lat") || "0"), parseFloat(building.getAttribute("lng") || "0")],
//       title: title,
//       imgSrc: [""],
//       description: [""],
//       tag: "Academics (Building)",
//       color: "var(--ion-color-primary)",
//       chip: [],
//     };
//     markers.push(marker);
//   }

//   const markerStr = JSON.stringify(markers, null, 2);

//   console.log(`export const markers = ${markerStr};`);
// }

function Maps() {
  /* Hooks */
  const Toast = useToast();
  const history = useHistory();
  const context = useContext();

  /* State variables */
  const [user, loading, error] = useAuthState(auth);
  const [schoolName, setSchoolName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [center, setCenter] = useState<[number, number]>([37.250458, -120.350249]);
  const [mapZoom, setZoom] = useState(6);
  const [defaultLat, setDefaultLat] = useState(0);
  const [defaultLong, setDefaultLong] = useState(0);
  const [defaultZoom, setDefaultZoom] = useState(0);
  const [overlayIndex, setOverlayIndex] = useState<number>(-1);
  const [markerFilter, setMarkerFilter] = useState<string>("ALL");
  const [filteredMarkers, setFilteredMarkers] = useState<Record<string, MapMarker[]>>(markers);


  /**
   * @description filters the map markers to only include those selected by the user
   * 
   * @param {string} filter the kind of map pin to display {All, Dining, Housing, Academics, Recreation}
   */
  const setMarkers = (filter: string): void => {
    if (filter === "A") {
      setFilteredMarkers(markers);
    } else {
      const filteredData: Record<string, MapMarker[]> = {};
      Object.keys(markers).forEach((schoolName: string) => {
        filteredData[schoolName] = markers[schoolName].filter((marker: MapMarker) =>
          marker.tag.includes(filter)
        );
      });
      setFilteredMarkers(filteredData);
    }
  }


  /**
   * @description routes to a given url and pushed it to the history stack
   * 
   * @param {string} path the url path being routed to 
   * @param {string} direction the type of animation being played during url navigation
   */
  const dynamicNavigate = (path: string, direction: RouterDirection) => {
    history.push(path);
  }

  /**
   * @description Sets the map to a default view based on school location
   */
  const setDefaultCenter = (): void => {
    setCenter([defaultLat, defaultLong]);
    setZoom(defaultZoom);
  };

  /**
   * @description gets school latitude and longitude based
   * on school name and sets map center/zoom
   * accordingly
   */
  const getSchoolLocation = (): void => {
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
   * @description sets map view to only show
   * certain markers based on a filter chosen by the user
   * 
   * @param {string} filter the type of marker being displayed (Housing, Dining, Recreation, etc.)
   */
  const updateMarkers = (filter: string) => {
    setMarkerFilter(filter);
    setMarkers(filter);
  };

  useIonViewWillEnter(() => {
    setClassName("");
  })

  /**
   * Loads school from local storage (Preferences API)
   */
  const setSchool = useCallback(async () => {
    const school = await Preferences.get({ key: 'school' });
    if (school && school.value) {
      setSchoolName(school.value);
    } else {
      const toast = Toast.create({ message: 'Something went wrong', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  }, []);


  useEffect(() => {
    // parseXml(locations);
    // parseXml(buildings);
  }, [])


  useEffect(() => {
    setSchool();
  }, [])

  /**
   * Runs on page enter
   * 
   * Sets center based on if pin was clicked on different page
   */
  useIonViewDidEnter(() => {
    if (!loading && !user) {
      history.replace("/landing-page");
    } else if (schoolName.length > 0) {
      context.setShowTabs(true);
      let lat: string = localStorage.getItem("lat") || "";
      let long: string = localStorage.getItem("long") || "";
      if (lat !== "" && long !== "") {
        setCenter([parseFloat(lat), parseFloat(long)]);
        localStorage.removeItem("long");
        localStorage.removeItem("lat");
        setZoom(18.5);
      }
    }
  }, [user, loading, schoolName]);


  /**
   * Runs on initial load
   * Grabs school location based on redux storage
   */
  useEffect(() => {
    if (schoolName.length > 0) {
      getSchoolLocation();
    }
  }, [schoolName]);

  useEffect(() => {
    context.setShowTabs(true);
  }, []);

  return (
    <IonPage className={className}>
      <IonContent fullscreen={true} className="no-scroll-content">
        <div className={!context.darkMode ? "overlaySearch" : "overlaySearchDark"}>
          <IonSelect
            interface="action-sheet"
            okText="Filter"
            cancelText="Cancel"
            value={markerFilter}
            placeholder="Filter: ALL"
            onIonChange={(e: any) => {
              setOverlayIndex(-1);
              updateMarkers(e.detail.value);
            }}
            style={{ fontWeight: "bold" }}
          >
            <IonSelectOption value="A">All</IonSelectOption>
            <IonSelectOption value="Dining">Dining</IonSelectOption>
            <IonSelectOption value="Housing">Housing</IonSelectOption>
            {schoolName && schoolName === "UC Davis" &&
              <>
                <IonSelectOption value="Stores">Stores</IonSelectOption>
              </>
            }
            <IonSelectOption value="Academics">Academics</IonSelectOption>
            <IonSelectOption value="Recreation">Recreation</IonSelectOption>
          </IonSelect>
        </div>

        <Map
          provider={(x, y, z, dpr) => mapTiler(context.darkMode, x, y, z, dpr)}
          center={center}
          zoom={mapZoom}
          minZoom={5}
          animate={true}
          zoomSnap={false}
          attributionPrefix={false}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          onClick={(e) => {
            console.log(e.latLng)
            setOverlayIndex(-1);
          }}
        >

          <ZoomControl style={{ left: "85%", top: "50%", opacity: "95%", zIndex: '100' }} buttonStyle={!context.darkMode ? zoomControlButtonsStyle : zoomControlButtonsStyleDark} />

          {filteredMarkers[schoolName] && filteredMarkers[schoolName].map((marker : MapMarker, index : number) => {
            return (
              <Marker
                color={marker.color}
                style={{ opacity: "85%" }}
                key={marker.title + index.toString()}
                anchor={[marker.location[0], marker.location[1]]}
                width={35}
                offset={[0, -5]}
                onClick={() => {
                  if (mapZoom > 17) {
                    setCenter([
                      marker.location[0] - 0.0001,
                      marker.location[1],
                    ]);
                  } else {
                    setCenter([
                      marker.location[0] - 0.00225,
                      marker.location[1],
                    ]);
                  }

                  setOverlayIndex(-1);
                  setOverlayIndex(index);
                }}
              />
            );
          })
          }
          {schoolName in filteredMarkers && overlayIndex != -1 && filteredMarkers[schoolName][overlayIndex] && "location" in filteredMarkers[schoolName][overlayIndex] ? (
            <Overlay
              anchor={[
                filteredMarkers[schoolName][overlayIndex].location[0],
                filteredMarkers[schoolName][overlayIndex].location[1],
              ]}
              offset={[110, 25]}
            >
              <IonCard
                onClick={() => { setClassName("ion-page-ios-notch"); dynamicNavigate("markerInfo/" + schoolName + "/" + filteredMarkers[schoolName][overlayIndex].title, "forward"); }}
                style={!context.darkMode ? { width: "55vw", opacity: "90%" } : { width: "55vw", opacity: "95%" }}
                mode="ios"
              >
                <IonCardContent>
                  <div style={{ height: "1vh" }} />
                  <IonCardTitle style={{ fontSize: "medium" }} mode="ios">
                    {filteredMarkers[schoolName][overlayIndex].title}
                  </IonCardTitle>
                  <IonFab horizontal="end" vertical="top">
                    <p style={{ fontWeight: "bold", fontSize: "2.5vw", color: filteredMarkers[schoolName][overlayIndex].color }}>
                      {filteredMarkers[schoolName][overlayIndex].tag}
                    </p>
                  </IonFab>
                  <div style={{ height: "1vh" }} />
                  {filteredMarkers[schoolName][overlayIndex].description[0] &&
                    <p>
                      {filteredMarkers[schoolName][overlayIndex].description[0].substring(0, 110) + " ... "} <IonText color={getIonColor(filteredMarkers[schoolName][overlayIndex].color)}>(more)</IonText>
                    </p>
                  }
                  {filteredMarkers[schoolName][overlayIndex].imgSrc &&
                    filteredMarkers[schoolName][overlayIndex].imgSrc.length > 0 ? (
                    <>
                      <div style={{ height: "1vh" }} />
                      <img
                        className="ion-img-container"
                        style={{ borderRadius: '10px', width: '100%' }}
                        src={filteredMarkers[schoolName][overlayIndex].imgSrc[0]}
                        alt=""
                        onError={() => {
                          filteredMarkers[schoolName][overlayIndex].imgSrc = [];
                        }}
                      />
                    </>
                  ) : null}
                </IonCardContent>
              </IonCard>
            </Overlay>
          ) : null}
          <IonFab horizontal="start" vertical="bottom" style={{ transform: 'translateY(15%)' }}>
            <p style={!context.darkMode ? { fontSize: "1em", color: "#0D1117", fontWeight: "bold" } : { fontSize: "1em", color: "#FFFFFF", fontWeight: "bold" }}>
              {schoolName}
            </p>
          </IonFab>
          <IonFab horizontal="end" vertical="bottom" style={{ transform: 'translateX(15%) translateY(-15%)' }}>
            <IonButton color={!context.darkMode ? "light" : "light-item"} onClick={setDefaultCenter} mode="ios" style={{ borderRadius: '7.5px' }}>
              {!context.darkMode ?
                <IonIcon icon={schoolOutline} />
                :
                <img style={{ width: "20px", borderRadius: '7.5px' }} src={schoolOutlineWhite} />

              }
            </IonButton>
          </IonFab>
        </Map>
      </IonContent>
    </IonPage>
  );
}

export default Maps;
