/* React */
import { Route, Redirect } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import {
  IonApp,
  IonTabs,
  IonRouterOutlet,
  IonSpinner,
  setupIonicReact,
  IonTabBar,
  IonTabButton,
  // IonBadge,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./App.css";

import Home from "./pages/Home";
import Community from "./pages/Community";
import Maps from "./pages/Maps";
import User from "./pages/User";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import RedirectComponent from "./pages/RedirectComponent";
import { UserProfile } from "./pages/UserProfile";
import UIContext from "./my-context";

import { ToastProvider, useToast } from "@agney/ir-toast";
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MapIcon from "@mui/icons-material/Map";
import { db, getCurrentUser, promiseTimeout } from "./fbconfig";
import { doc, getDoc } from "firebase/firestore";
import { setSchoolColorPallete, setUserState } from "./redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { setDarkMode } from "./redux/actions";
import { Keyboard, KeyboardStyle, KeyboardStyleOptions, } from "@capacitor/keyboard";
import { StatusBar, Style } from '@capacitor/status-bar';
import Post from "./pages/Post";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { PushNotifications } from "@capacitor/push-notifications";
import { FCM } from "@capacitor-community/fcm";
import AppUrlListener from "./pages/AppUrlListener";
import ForgotPassword from "./pages/ForgotPassword";
import { createBrowserHistory } from "history";
import { ConnectionStatus, Network } from '@capacitor/network';
import { getDatabase, ref, onValue, goOffline, goOnline } from "firebase/database";
import { timeout } from "./components/functions";

// // set up base push notifications with Capacitor
// await PushNotifications.requestPermissions();
// await PushNotifications.register();

// // set up Firebase Cloud Messaging topics
// FCM.subscribeTo({ topic: "test" })
//   .then((r) => alert(`subscribed to topic`))
//   .catch((err) => console.log(err));

setupIonicReact({
  swipeBackEnabled: false,
});

// Global variables
const historyInstance = createBrowserHistory();
const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
}
const keyStyleOptionsLight: KeyboardStyleOptions = {
  style: KeyboardStyle.Light
}


const RoutingSystem: React.FunctionComponent = () => {
  const { showTabs } = React.useContext(UIContext);
  const [selectedTab, setSelectedTab] = useState<string>("home");
  let tabBarStyle = showTabs ? undefined : { display: "none" };
  const schoolName = useSelector((state: any) => state.user.school);
  const schoolColorPallete = useSelector((state: any) => state.schoolColorPallete.colorToggled);

  useEffect(() => { }, []); // add notif count in useEffect dependency array, utilize redux to save state
  return (
    <ToastProvider value={{ color: "primary", duration: 2000 }}>
      <IonReactRouter history={historyInstance}>
        <AppUrlListener></AppUrlListener>
        <IonTabs onIonTabsWillChange={(e: any) => { setSelectedTab(e.detail.tab); }}>
          <IonRouterOutlet>
            <Route path="/:tab(home)" exact={true}>
              {" "}
              <Home />{" "}
            </Route>
            <Route
              path="/:tab(community)"
              component={Community}
              exact={true}
            />
            <Route path="/:tab(maps)" component={Maps} exact={true} />
            <Route path="/:tab(user)" exact={true}>
              {" "}
              <User />{" "}
            </Route>
            <Route path="/landing-page" exact={true}>
              {" "}
              <LandingPage />{" "}
            </Route>
            <Route path="/post/:key" component={Post} />
            <Route path="/about/:uid" component={UserProfile} />
            <Route path="/register" component={Register} exact={true} />
            <Route path="/forgot-password" component={ForgotPassword} exact={true} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/404" component={RedirectComponent} />
            <Route
              exact
              path="/"
              render={() => <Redirect to="/home" />}
            />
          </IonRouterOutlet>
          <IonTabBar slot="bottom" style={tabBarStyle}>
            <IonTabButton tab="home" href="/home">
              <HomeIcon
                fontSize="medium"
                style={selectedTab === 'home' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.3vh",  color:'#58c2a2' } 
                : selectedTab === 'home' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.3vh" }
                : selectedTab === 'home' ? { fontSize: "4.3vh" } 
                : { fontSize: "4.00vh" }}
              />
            </IonTabButton>
            <IonTabButton tab="community" href="/community">
              <LocalFireDepartmentIcon
                fontSize="medium"
                style={selectedTab === 'community' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.3vh",  color:'#58c2a2' } 
                : selectedTab === 'community' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.3vh" } 
                : selectedTab === 'community' ? { fontSize: "4.3vh" }
                : { fontSize: "4.00vh" }}
              />
            </IonTabButton>
            <IonTabButton tab="maps" href="/maps">
              <MapIcon
                fontSize="medium"
                style={selectedTab === 'maps' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.3vh",  color:'#58c2a2' } 
                : selectedTab === 'maps' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.3vh" } 
                : selectedTab === 'maps' ? { fontSize: "4.3vh" }
                : { fontSize: "4.00vh" }}
              />
            </IonTabButton>
            <IonTabButton tab="user" href="/user">
              <AccountCircleIcon
                fontSize="medium"
                style={selectedTab === 'user' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.3vh",  color:'#58c2a2' } 
                : selectedTab === 'user' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.3vh" } 
                : selectedTab === 'user' ? { fontSize: "4.3vh" }
                : { fontSize: "4.00vh" }}
              />
              {/* {true &&  */}
              {/* <IonBadge color="danger">{5}</IonBadge> */}
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </ToastProvider>
  );
};

const App: React.FunctionComponent = () => {
  const Toast = useToast();
  const dispatch = useDispatch();
  const [busy, setBusy] = useState<boolean>(true);
  const darkMode = localStorage.getItem("darkMode") || "false";
  const schoolColorToggled = localStorage.getItem("schoolColorPallete") || "false";
  const condition = navigator.onLine;
  const [appActive, setAppActive] = useState<boolean>(true);
  const datab = getDatabase();
  const schoolName = useSelector((state: any) => state.user.school);

  // Network.addListener('networkStatusChange', status => {
  //   Network.getStatus().then((status: ConnectionStatus) => {
  //     if (status.connected) {
  //       Toast.success('Online');
  //       setAppActive(true);
  //     } else {
  //       Toast.warning('Offline');
  //       setAppActive(false);
  //     }
  //   })
  // });

  CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    // console.log('App state changed. Is active?', isActive);
    if (!isActive) {
      setAppActive(false);
      timeout(5000).then(() => {
        if(!appActive){
          goOffline(datab);
          goOnline(datab);
        }
      })
    } else {
      setAppActive(true);
    }
  });

  const addListeners = async () => {
    await PushNotifications.addListener('registration', token => {
      console.info('Registration token: ', token.value);
    });

    await PushNotifications.addListener('registrationError', err => {
      console.error('Registration error: ', err.error);
    });

    await PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push notification received: ', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });
  };

  const registerNotifications = async () => {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }
    }
  };

  // useEffect(() => {
  //   const db = getDatabase();
  //   const connectedRef = ref(db, ".info/connected");
  //   onValue(connectedRef, (snap) => {
  //     timeout(10000).then(() => {
  //       if (snap.val() === true) {
  //         console.log('successfully connected');
  //       }
  //       else {
  //         goOffline(db);
  //         goOnline(db);
  //       }
  //     })
  //   });
  // }, [])

  useEffect(() => {
    if (condition) {
      fetch('https://www.google.com/', {
        mode: 'no-cors',
      }).then(() => {
        console.log('online');
        if(schoolColorToggled == "false") {
          dispatch(setSchoolColorPallete(false));
        } else {
          dispatch(setSchoolColorPallete(true));
        }
        if (darkMode == "false") {
          dispatch(setDarkMode(false));
          Keyboard.setStyle(keyStyleOptionsLight);
          StatusBar.setStyle({ style: Style.Light });
        } else {
          document.body.classList.toggle("dark");
          dispatch(setDarkMode(true));
          Keyboard.setStyle(keyStyleOptionsDark);
          StatusBar.setStyle({ style: Style.Dark });
        }
        const hasLoadedUser = promiseTimeout(30000, getCurrentUser());
        hasLoadedUser.then((user: any) => {
          if (user) {
            let school = "";
            const userRef = doc(db, "userData", user.uid);
            const docLoaded = promiseTimeout(30000, getDoc(userRef));
            docLoaded.then((userSnap) => {
              if (userSnap.exists()) {
                school = userSnap.data().school;
              }
              // const userData : any = {
              //   displayName : user.displayName,
              //   email : user.email,
              //   school : school,
              // }
              // localStorage.setItem("userData", JSON.stringify(userData));
              dispatch(setUserState(user.displayName, user.email, false, school));
              setBusy(false);
              window.history.replaceState({}, "", "/home");
            });
            docLoaded.catch((err) => {
              console.log(err);
              // const userData : any = {
              //   displayName : user.displayName,
              //   email : user.email,
              //   school : school,
              // }
              // localStorage.setItem("userData", JSON.stringify(userData));
              dispatch(setUserState(user.displayName, user.email, false, ""));
              setBusy(false);
              window.history.replaceState({}, "", "/home");
            });
          } else {
            setBusy(false);
            window.history.replaceState({}, "", "/landing-page");
            registerNotifications().then(() => {
              addListeners();
            });
          }
          return () => { Network.removeAllListeners(); PushNotifications.removeAllListeners().then(() => console.log("listeners removed")) }
        });
        hasLoadedUser.catch((err: any) => {
          console.log(err);
          Toast.error(err);
          setBusy(false);
          window.history.replaceState({}, "", "/landing-page");
        });
      }).catch(() => {
        console.log('offline');
        setBusy(true);
      });
    } else {
      console.log('offline');
      setBusy(true);
    }
  }, []);

  return (
    <IonApp>
      {busy ? (
        <IonSpinner class="ion-spinner" name="dots" color={schoolName == "Cal Poly Humboldt" ? "tertiary" : "primary"} />
      ) : (
        <RoutingSystem />
      )}
    </IonApp>
  );
};

export default App;
