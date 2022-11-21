/* React */
import { Route, Redirect } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import {
  IonApp,
  IonTabs,
  IonRouterOutlet,
  IonSpinner,
  setupIonicReact,
  IonTabBar,
  IonTabButton,
  IonBadge,
  useIonToast,
  isPlatform,
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
import { TabsContextProvider, useTabsContext } from "./my-context";

import { ToastProvider, useToast } from "@agney/ir-toast";
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MapIcon from "@mui/icons-material/Map";
import auth, { db, getCurrentUser, promiseTimeout } from "./fbconfig";
import { doc, getDoc } from "firebase/firestore";
import { setNotif, setSchoolColorPallete, setSensitiveContent, setUserState } from "./redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { setDarkMode } from "./redux/actions";
import { Keyboard, KeyboardStyle, KeyboardStyleOptions, } from "@capacitor/keyboard";
import { StatusBar, Style } from '@capacitor/status-bar';
import Post from "./pages/Post";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { ActionPerformed, PushNotifications, PushNotificationSchema } from "@capacitor/push-notifications";
import { FCM } from "@capacitor-community/fcm";
import AppUrlListener from "./pages/AppUrlListener";
import ForgotPassword from "./pages/ForgotPassword";
import { createBrowserHistory } from "history";
import { Network } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import { useHistory } from "react-router";
import Class from "./pages/Class";
import ChatRoom from "./pages/ChatRoom";
import DirectMessages from "./pages/DirectMessages";
// import School from "./pages/School";
import Posttypes from "./pages/Posttypes";
import { Capacitor } from "@capacitor/core";

setupIonicReact({
  swipeBackEnabled: false
});

SplashScreen.show({
  showDuration: 500,
  autoHide: true,
  fadeInDuration: 300,
  fadeOutDuration: 300
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
  const tabs = useTabsContext();
  const [selectedTab, setSelectedTab] = useState<string>("home");
  let tabBarStyle = tabs?.showTabs ? undefined : { display: "none" };
  const dispatch = useDispatch();
  const schoolName = useSelector((state: any) => state.user.school) || "";
  const schoolColorPallete = useSelector((state: any) => state.schoolColorPallete.colorToggled) || false;
  const history = useHistory();
  const notif = useSelector((state: any) => state.notifSet.set) || false;
  const [present] = useIonToast();

  const presentToast = (message: string, url: string, position: 'top' | 'middle' | 'bottom') => {
    dispatch(setNotif(true));
    message = message.replace(' sent a DM', "");
    present({
      message: message,
      duration: 3500,
      position: position,
      buttons: [
        {
          text: 'Open',
          role: 'info',
          handler: () => { history.push(url); dispatch(setNotif(false)); }
        },
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => { }
        }
      ],
      cssClass: 'toast-options',
    });
  }

  useEffect(() => {
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        // alert('Push received: ' + JSON.stringify(notification));
        let urlJSON = notification.data["gcm.notification.data"]
        let noBackSlashes = urlJSON.toString().replaceAll('\\', '');
        let removedUrl = noBackSlashes.substring(7, noBackSlashes.length);
        let finalUrl = removedUrl.slice(1, removedUrl.length - 2);
        // alert(finalUrl);
        presentToast(notification.body || "", finalUrl || "", 'top');
      },
    ).then(() => {
      console.log('adding listener for push notif received');
    });
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // alert('clicked on notif');
        let urlJSON = notification.notification.data["gcm.notification.data"]
        let noBackSlashes = urlJSON.toString().replaceAll('\\', '');
        let removedUrl = noBackSlashes.substring(7, noBackSlashes.length);
        let finalUrl = removedUrl.slice(1, removedUrl.length - 2);
        dispatch(setNotif(false));
        history.push(finalUrl);
      },
    ).then(() => {
      console.log('adding listener for notif action performed');
    });
  }, []); // add notif count in useEffect dependency array, utilize redux to save state
  return (
    <ToastProvider value={{ color: "primary", duration: 2000 }}>
      <AppUrlListener></AppUrlListener>
      <IonTabs onIonTabsWillChange={(e: any) => { setSelectedTab(e.detail.tab); }}>
        <IonRouterOutlet>
          <Route path="/:tab(home)" exact={true}>
            {" "}
            <Home />{" "}
          </Route>
          {/* <Route path="/:tab(school)" component={School} exact={true} /> */}
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
          <Route path="/class/:className" component={Class} />
          <Route path="/type/:type" component={Posttypes} />
          <Route path="/chatroom/:collectionPath" component={ChatRoom} />
          <Route path="/direct/:directMessageId" component={DirectMessages} />
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
              style={selectedTab === 'home' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#58c2a2' }
                : selectedTab === 'home' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'home' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
          </IonTabButton>
          {/*<IonTabButton tab="school" href="/school">
             <SchoolIcon
              fontSize="medium"
              style={selectedTab === 'school' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#58c2a2' }
                : selectedTab === 'school' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'school' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
          </IonTabButton> */}
          <IonTabButton tab="community" href="/community">
            <LocalFireDepartmentIcon
              fontSize="medium"
              style={selectedTab === 'community' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#58c2a2' }
                : selectedTab === 'community' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'community' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
          </IonTabButton>
          <IonTabButton tab="maps" href="/maps">
            <MapIcon
              fontSize="medium"
              style={selectedTab === 'maps' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#58c2a2' }
                : selectedTab === 'maps' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'maps' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
          </IonTabButton>
          <IonTabButton tab="user" href="/user">
            <AccountCircleIcon
              fontSize="medium"
              style={selectedTab === 'user' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#58c2a2' }
                : selectedTab === 'user' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'user' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
            {notif &&
              < IonBadge color="danger">{'!'}</IonBadge>
            }
          </IonTabButton>
        </IonTabBar>
      </IonTabs>

    </ToastProvider >
  );
};

const App: React.FunctionComponent = () => {
  const Toast = useToast();
  const dispatch = useDispatch();
  const [busy, setBusy] = useState<boolean>(true);
  const darkMode = localStorage.getItem("darkMode") || "false";
  const sensitiveContentToggled = localStorage.getItem("sensitiveContent") || "false";
  const schoolColorToggled = localStorage.getItem("schoolColorPallete") || "false";
  const condition = navigator.onLine;
  const schoolName = useSelector((state: any) => state.user.school) || "";
  const tabs = useTabsContext();

  const registerNotifications = async () => {
    let permStatus = await PushNotifications.checkPermissions();
    console.log(permStatus.receive);
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      } else {
        PushNotifications.register().then(() => {
          FCM.getToken().then((token) => {
            localStorage.setItem("notificationsToken", token.token);
            console.log('setting notif token item: ', token.token);
            console.log(token.token);
          });
        });
      }
    }
  };

  const onDeviceReady = useCallback(() => {
    console.log("device ready")
    auth.onAuthStateChanged((user) => {
      if(user) {
        console.log("user reloading");
        user.reload();
      }
    })
  }, []);

  useEffect(() => {
    console.log("HI")
    document.addEventListener("deviceready", onDeviceReady);
    return () => {
      document.removeEventListener("deviceready", onDeviceReady);
    }
  }, [])

  useEffect(() => {
    PushNotifications.getDeliveredNotifications().then((notifs) => {
      if (notifs.notifications.length > 0) {
        dispatch(setNotif(true));
      } else {
        dispatch(setNotif(false));
      }
    });
  }, [])

  useEffect(() => {
    if (condition) {
      registerNotifications();
      fetch('https://www.google.com/', {
        mode: 'no-cors',
      }).then(() => {
        console.log('online');
        if (schoolColorToggled == "false") {
          dispatch(setSchoolColorPallete(false));
        } else {
          dispatch(setSchoolColorPallete(true));
        }
        if (sensitiveContentToggled == "false") {
          dispatch(setSensitiveContent(false));
        } else {
          dispatch(setSensitiveContent(true));
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
            let school = localStorage.getItem("userSchoolName") || "";
            if (school == "") { // first time loading school...
              console.log('first login');
              const userRef = doc(db, "userData", user.uid);
              const docLoaded = promiseTimeout(30000, getDoc(userRef));
              docLoaded.then((userSnap) => {
                if (userSnap.exists()) {
                  school = userSnap.data().school;
                }
                localStorage.setItem("userSchoolName", school.toString());
                dispatch(setUserState(user.displayName, user.email, false, school));
                setBusy(false);
                // tabs.setShowTabs(true);
                window.history.replaceState({}, "", "/home");
              });
              docLoaded.catch((err) => {
                console.log(err);
                Toast.error('Check your internet connection');
              });
            } else {
              dispatch(setUserState(user.displayName, user.email, false, school));
              setBusy(false);
              // tabs.setShowTabs(true);
              window.history.replaceState({}, "", "/home");
            }
          } else {
            setBusy(false);
            window.history.replaceState({}, "", "/landing-page");
          }
          return () => { Network.removeAllListeners() }
        });
        hasLoadedUser.catch((err: any) => {
          console.log(err);
          Toast.error(err);
          setBusy(false);
          window.history.replaceState({}, "", "/landing-page");
        });
      }).catch(() => {
        console.log('offline');
        Toast.error("Check your internet connection");
        setBusy(true);
      });
    } else {
      console.log('offline');
      Toast.error("Check your internet connection");
      setBusy(true);
    }
  }, []);

  return (
    <IonApp>
      {busy ? (
        <IonSpinner class="ion-spinner" name="dots" color={schoolName == "Cal Poly Humboldt" ? "tertiary" : "primary"} />
      ) : (
        <TabsContextProvider>
          <IonReactRouter history={historyInstance}>
            <RoutingSystem />
          </IonReactRouter>
        </TabsContextProvider>
      )}
    </IonApp>
  );
};

export default App;
