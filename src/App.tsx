/* Ionic/React + Capacitor */
import React, { useState, useEffect, useCallback } from "react";
import {
  IonApp, IonTabs,
  IonRouterOutlet, IonSpinner,
  setupIonicReact, IonTabBar,
  IonTabButton, IonBadge,
  useIonToast,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FCM } from "@capacitor-community/fcm";
import { createBrowserHistory } from "history";
import { Network } from '@capacitor/network';
import { setDarkMode } from "./redux/actions";
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardStyle, KeyboardStyleOptions, } from "@capacitor/keyboard";
import { setNotif, setSchoolColorPallete, setSensitiveContent, setUserState } from "./redux/actions";
import { ActionPerformed, PushNotifications, PushNotificationSchema } from "@capacitor/push-notifications";

/* Pages */
import Home from "./pages/Home";
import Post from "./pages/Post";
import Maps from "./pages/Maps";
import User from "./pages/User";
import Class from "./pages/Class";
import ChatRoom from "./pages/ChatRoom";
import Register from "./pages/Register";
import Community from "./pages/Community";
import Posttypes from "./pages/Posttypes";
import LandingPage from "./pages/LandingPage";
import { UserProfile } from "./pages/UserProfile";
import AppUrlListener from "./pages/AppUrlListener";
import ForgotPassword from "./pages/ForgotPassword";
import DirectMessages from "./pages/DirectMessages";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import RedirectComponent from "./pages/RedirectComponent";

/* Other Components */
import { ToastProvider, useToast } from "@agney/ir-toast";
import { TabsContextProvider, useTabsContext } from "./my-context";

/* Icons */
import MapIcon from "@mui/icons-material/Map";
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

/* Firestore/Google */
import auth, { db, getCurrentUser, promiseTimeout } from "./fbconfig";
import { doc, getDoc } from "firebase/firestore";


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
import "./App.css";
import "./theme/variables.css";



/* Globals */
setupIonicReact({
  swipeBackEnabled: false
});

SplashScreen.show({
  showDuration: 500,
  autoHide: true,
  fadeInDuration: 300,
  fadeOutDuration: 300
});

const historyInstance = createBrowserHistory();
const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
}
const keyStyleOptionsLight: KeyboardStyleOptions = {
  style: KeyboardStyle.Light
}


/**
 * Main app tabs and routing logic
 */
const RoutingSystem: React.FunctionComponent = () => {

  /* Hooks */
  const tabs = useTabsContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const [present] = useIonToast();

  /* State variables */
  const [selectedTab, setSelectedTab] = useState<string>("home");

  /* Global state (redux/context) */
  let tabBarStyle = tabs?.showTabs ? undefined : { display: "none" };
  const schoolName = useSelector((state: any) => state.user.school) || "";
  const schoolColorPallete = useSelector((state: any) => state.schoolColorPallete.colorToggled) || false;
  const notif = useSelector((state: any) => state.notifSet.set) || false;


  /**
   * A function that presents an in-app toast notification
   * when they recieive a DM push notification
   * 
   * @param {string} message the message to be displayed
   * @param {string} url the url to be opened if a user clicks the notification
   * @param {string} position where the toast will be displayed on the screen (top, middle, bottom)
   */
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

  /**
   * Runs once on app load
   * Adds a listener to PushNotifications
   */
  useEffect(() => {
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        let urlJSON = notification.data["gcm.notification.data"]
        let noBackSlashes = urlJSON.toString().replaceAll('\\', '');
        let removedUrl = noBackSlashes.substring(7, noBackSlashes.length);
        let finalUrl = removedUrl.slice(1, removedUrl.length - 2);
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
  }, []);

  return (
    <ToastProvider value={{ color: "primary", duration: 2000 }}>
      <AppUrlListener></AppUrlListener>
      <IonTabs onIonTabsWillChange={(e: any) => { setSelectedTab(e.detail.tab); }}>
        <IonRouterOutlet>
          <Route path="/:tab(home)" exact={true}> <Home /> </Route>
          <Route path="/:tab(community)" exact={true} component={Community} />
          <Route path="/:tab(maps)" exact={true} component={Maps} />
          <Route path="/:tab(user)" exact={true}> <User /> </Route>
          <Route path="/landing-page" exact={true}> <LandingPage /> </Route>
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
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
        <IonTabBar slot="bottom" style={tabBarStyle}>
          <IonTabButton tab="home" href="/home">
            <HomeIcon
              fontSize="medium"
              style={selectedTab === 'home' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#00856A' }
                : selectedTab === 'home' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'home' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
          </IonTabButton>
          <IonTabButton tab="community" href="/community">
            <LocalFireDepartmentIcon
              fontSize="medium"
              style={selectedTab === 'community' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#00856A' }
                : selectedTab === 'community' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'community' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
          </IonTabButton>
          <IonTabButton tab="maps" href="/maps">
            <MapIcon
              fontSize="medium"
              style={selectedTab === 'maps' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#00856A' }
                : selectedTab === 'maps' && schoolName !== "Cal Poly Humboldt" ? { fontSize: "4.5vh" }
                  : selectedTab === 'maps' ? { fontSize: "4.5vh" }
                    : { fontSize: "3.75vh" }}
            />
          </IonTabButton>
          <IonTabButton tab="user" href="/user">
            <AccountCircleIcon
              fontSize="medium"
              style={selectedTab === 'user' && schoolName === "Cal Poly Humboldt" && schoolColorPallete ? { fontSize: "4.5vh", color: '#00856A' }
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

  /* Hooks */
  const Toast = useToast();
  const dispatch = useDispatch();

  /* State variables */
  const condition = navigator.onLine;
  const [busy, setBusy] = useState<boolean>(true);

  /* Global state (redux/context) */
  const darkMode = localStorage.getItem("darkMode") || "false";
  const sensitiveContentToggled = localStorage.getItem("sensitiveContent") || "false";
  const schoolColorToggled = localStorage.getItem("schoolColorPallete") || "false";
  const schoolName = useSelector((state: any) => state.user.school) || "";

  /**
   * A function that will check permissions for push notifications on iOS
   * If accepted, user will be registered to receive push notifications
   * and will be assigned a unique token to identify them 
   * 
   * Uses Google FCM to send push notifications
   */
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

  /**
   * Coupled with below useEffect, this function will check if the user is logged in
   * When coming back to app after sometime in background
   */
  const onDeviceReady = useCallback(() => {
    console.log("device ready")
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("user reloading");
        user.reload();
      }
    })
  }, [auth]);

  /**
   * Adds listener to check if user is logged in when app is brought back to foreground
   */
  useEffect(() => {
    document.addEventListener("deviceready", onDeviceReady);
    return () => {
      document.removeEventListener("deviceready", onDeviceReady);
    }
  }, [auth]);


  /**
   * Checks if user has any new notifications and sets the notif state variable
   */
  useEffect(() => {
    PushNotifications.getDeliveredNotifications().then((notifs) => {
      if (notifs.notifications.length > 0) {
        dispatch(setNotif(true));
      } else {
        dispatch(setNotif(false));
      }
    });
  }, [])


  /**
   * Runs on app startup
   * Checks if user is logged in and sets the busy state variable
   * Sets dark mode if user has it toggled on
   * Redirects to Home page if user is logged in
   * Redirects to Login page if user is not logged in
   */
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
                window.history.replaceState({}, "", "/home");
              });
              docLoaded.catch((err) => {
                console.log(err);
                Toast.error('Check your internet connection');
              });
            } else {
              dispatch(setUserState(user.displayName, user.email, false, school));
              setBusy(false);
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
