/* React imports */
import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";

/* Ionic/Capacitor */
import {
  IonContent, IonCardTitle, IonCard, IonLabel, IonButton, IonIcon,
  IonFab, IonCardContent, IonSelect, IonSelectOption, IonPage, useIonViewDidEnter,
  RouterDirection, useIonViewDidLeave, useIonViewWillEnter, IonText
} from "@ionic/react";
import { schoolOutline } from "ionicons/icons";
import { Keyboard, KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";

/* Firebase */
import auth from "../fbConfig";

/* CSS + Other components */
import "../App.css";
import { useToast } from "@agney/ir-toast";
import { mapTiler, markers, schoolInfo, setMarkers, zoomControlButtonsStyle, zoomControlButtonsStyleDark } from "../helpers/maps-config";
import { Map, Marker, ZoomControl, Overlay } from "pigeon-maps";
import schoolOutlineWhite from '../images/school-outline-white.png';
import { useContext } from "../my-context";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
}

const getIonColor = (color : string) => {
  let c : string = "";
  for(let i = color.length - 2; i >= 0; --i) {
    if(color[i] === '-') {
      return c.split('').reverse().join('');
    }
    c += color[i];
  }
  return c.split('').reverse().join('');
}

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
  const [selectOptions, setSelectOptions] = useState<any>({});


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
  const setDefaultCenter = () => {
    setCenter([defaultLat, defaultLong]);
    setZoom(defaultZoom);
  };

  /**
   * @description gets school latitude and longitude based
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
   * @description sets map view to only show
   * certain markers based on a filter chosen by the user
   * 
   * @param {string} filter the type of marker being displayed (Housing, Dining, Recreation, etc.)
   */
  const updateMarkers = (filter: string) => {
    setMarkerFilter(filter);
    setMarkers(filter);
  };

  /**
   * Runs on page exit
   */
  useIonViewDidLeave(() => {
    setMarkerFilter("ALL");
  });

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
    context.setDarkMode(true);
    document.body.classList.toggle("dark");
    context.setDarkMode(true);
    if (Capacitor.getPlatform() === "ios") {
      Keyboard.setStyle(keyStyleOptionsDark);
      StatusBar.setStyle({ style: Style.Dark });
    }
  }, [context]);


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
   * Runs on page load
   * Sets styles for filter select options depending on schoolColorToggled
   */
  useEffect(() => {
    if (schoolName === "Cal Poly Humboldt" && context.schoolColorToggled) {
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
  }, [schoolName, context.schoolColorToggled])

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
        <div className={
          context.darkMode && schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "overlaySearchDark"
            : context.darkMode && schoolName === "Cal Poly Humboldt" && !context.schoolColorToggled ? "overlaySearchDarkNotHumboldt"
              : context.darkMode && schoolName !== "Cal Poly Humboldt" ? "overlaySearchDarkNotHumboldt"
                : !context.darkMode && schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "overlaySearch"
                  : "overlaySearchNotHumboldt"
        }>
          <IonLabel color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"}>{"Filter:"}</IonLabel>
          <IonSelect
            interface="action-sheet"
            interfaceOptions={selectOptions}
            okText="Filter"
            cancelText="Cancel"
            mode="ios"
            value={markerFilter}
            style={{ fontSize: "0.9em", transform: "translateY(-35%)" }}
            placeholder="Filter: ALL"
            onIonChange={(e: any) => {
              setOverlayIndex(-1);
              updateMarkers(e.detail.value);
            }}
          >
            <IonSelectOption value="ALL" class="all-option">All</IonSelectOption>
            <IonSelectOption value="Dining">Dining</IonSelectOption>
            <IonSelectOption value="Housing">Housing</IonSelectOption>
            <IonSelectOption value="Academics">Academics</IonSelectOption>
            <IonSelectOption value="Recreation">Recreation</IonSelectOption>
          </IonSelect>
        </div>

        <Map
          provider={mapTiler}
          center={center}
          zoom={mapZoom}
          animate={true}
          zoomSnap={false}
          attributionPrefix={false}
          onBoundsChanged={({ center, zoom }) => {
            setCenter(center);
            setZoom(zoom);
          }}
          onClick={(e) => {
            setOverlayIndex(-1);
          }}
        >
          <ZoomControl style={{ left: "85%", top: "50%", opacity: "95%", zIndex: '100' }} buttonStyle={context.darkMode ? zoomControlButtonsStyleDark : zoomControlButtonsStyle} />

          {markers ? markers.map((marker, index) => {
            return (
              <Marker
                color={marker.color}
                style={{ opacity: "85%" }}
                key={marker.title}
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
                onClick={() => { setClassName("ion-page-ios-notch"); dynamicNavigate("markerInfo/" + schoolName + "/" + markers[overlayIndex].title, "forward"); }}
                style={{ width: "55vw", opacity: "90%" }}
                mode="ios"
              >
                <IonCardContent>
                  <IonCardTitle style={{ fontSize: "medium" }} mode="ios">
                    {markers[overlayIndex].title}
                  </IonCardTitle>
                  <IonFab horizontal="end" vertical="top">
                    <p style={{ fontWeight: "bold", fontSize: "2.5vw", color: markers[overlayIndex].color }}>
                      {markers[overlayIndex].tag}
                    </p>
                  </IonFab>
                  <div style={{ height: "1vh" }} />
                  <p>
                    {markers[overlayIndex].description[0].substring(0, 110) + " ... "} <IonText color={getIonColor(markers[overlayIndex].color)}>(more)</IonText>
                  </p>
                  {markers[overlayIndex].imgSrc &&
                    markers[overlayIndex].imgSrc.length > 0 ? (
                    <>
                      <div style={{ height: "1vh" }} />
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
            <p style={schoolName === 'Cal Poly Humboldt' ?
              { fontSize: "1em", color: "#0D1117", fontWeight: "bold" } :
              { fontSize: "1em", color: "#0D1117", fontWeight: "bold" }}>
              {schoolName}
            </p>
          </IonFab>
          <IonFab horizontal="end" vertical="bottom">
            <IonButton color="light-item" onClick={setDefaultCenter} mode="ios">
              {context.darkMode ?
                <img style={{ width: "20px" }} src={schoolOutlineWhite} />
                :
                <IonIcon icon={schoolOutline} />
              }
            </IonButton>
          </IonFab>
        </Map>
      </IonContent>
    </IonPage>
  );
}

export default Maps;
