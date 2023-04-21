// Pages
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import Maps from './pages/Maps';
import Class from './pages/Class';
import LoadingPage from './pages/LoadingPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Post from './pages/Post';
import DirectMessages from './pages/DirectMessages';
import Posttypes from './pages/Posttypes';
import ChatRoom from './pages/ChatRoom';
import { SignIn } from './pages/SignIn';
import { Notifications } from './pages/Notifications';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Events } from './pages/Events';
import { UserProfile } from './pages/UserProfile';
import { MapMarkerInfo } from './pages/MapMarkerInfo';
import { HumboldtHank } from './pages/HumboldtHank';

// Ionic/Capacitor + React
import React from 'react';
import { Route, useHistory } from 'react-router-dom';
import {
  IonApp, IonIcon, IonRouterOutlet, IonTabBar,
  IonTabButton, IonTabs, setupIonicReact, useIonToast,
} from '@ionic/react';
import { useEffect } from 'react';
import { IonReactRouter } from '@ionic/react-router';
import { calendarOutline, calendarSharp, homeOutline, homeSharp, mapOutline, mapSharp, personOutline, personSharp } from 'ionicons/icons';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import {
  Keyboard, KeyboardStyle,
  KeyboardStyleOptions,
} from "@capacitor/keyboard";
import { StatusBar, Style } from '@capacitor/status-bar';

// CSS
import "./App.css";
import './theme/variables.css';
import './theme/custom-tab-bar.css';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// Firebase/Google
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Other imports
import { createBrowserHistory } from "history";
import { ToastProvider } from "@agney/ir-toast";
import { useContext } from "./my-context";
import { FCM } from '@capacitor-community/fcm';
import ForestIcon from '@mui/icons-material/Forest';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';

// Global variables
setupIonicReact({ mode: 'ios' }); // ios for iPhone, md for Android, affects ALL components
const historyInstance = createBrowserHistory();
SplashScreen.show({
  autoHide: true,
  fadeInDuration: 300,
  fadeOutDuration: 300
});
const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
}

/**
 * Handles routing in app
 * Includes tab bar routing and all page components
 */
const RoutingSystem: React.FunctionComponent = () => {
  /* hooks */
  const context = useContext();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = React.useState<string>('home');
  const [present] = useIonToast();

  /* state variables */
  let tabBarStyle = context.showTabs;

  /**
   * A function that presents an in-app toast notification
   * when they recieive a DM push notification
   * 
   * @param {string} message the message to be displayed
   * @param {string} url the url to be opened if a user clicks the notification
   * @param {string} position where the toast will be displayed on the screen (top, middle, bottom)
   */
  const presentToast = (message: string, url: string, position: 'top' | 'middle' | 'bottom') => {
    message = message.replace(' sent a DM', "");
    present({
      message: message,
      duration: 3500,
      position: position,
      buttons: [
        {
          text: 'Open',
          role: 'info',
          handler: () => { history.push(url); }
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
    if (Capacitor.getPlatform() !== 'ios') {
      return;
    }
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
        history.push(finalUrl);
      },
    ).then(() => {
      console.log('adding listener for notif action performed');
    });
  }, []);

  return (
    /* Allows use of toast popups throughout app using the useToast() hook */
    <ToastProvider value={{ color: "primary", duration: 2000 }}>

      {/* Routing */}
      <IonTabs onIonTabsDidChange={(e) => { setSelectedTab(e.detail.tab) }}>
        <IonRouterOutlet>
          <Route path="/" exact component={LoadingPage} />
          <Route path="/loadingPage" exact component={LoadingPage} />
          <Route path="/landing-page" exact component={LandingPage} />
          <Route path="/sign-in" exact component={SignIn} />
          <Route path="/forgot-password" exact component={ForgotPassword} />
          <Route path="/register" exact component={Register} />
          <Route path="/:tab(home)" exact component={Home} />
          <Route path="/:tab(maps)" exact component={Maps} />
          <Route path="/:tab(events)" exact component={Events} />
          <Route path="/:tab(settings)" exact component={Settings} />
          <Route path="/:tab(hank)" exact component={HumboldtHank} />
          <Route path="/markerInfo/:school/:title" component={MapMarkerInfo} />
          <Route path="/about/:school/:uid" component={UserProfile} />
          <Route path="/post/:school/:userName/:key" component={Post} />
          <Route path="/direct/:schoolName/:directMessageId" component={DirectMessages} />
          <Route path="/chatroom/:schoolName/:collectionPath" component={ChatRoom} />
          <Route path="/privacy-policy" exact component={PrivacyPolicy} />
          <Route path="/notifications" exact component={Notifications} />
          <Route path="/class/:schoolName/:className" component={Class} />
          <Route path="/type/:schoolName/:type" exact component={Posttypes} />
        </IonRouterOutlet>

        {/* Bottom Tabs / Tab Bar */}
        <IonTabBar style={tabBarStyle ? {} : { display: "none" }} slot="bottom">
          <IonTabButton className={context.darkMode ? "tab-dark" : "tab-light"} tab="home" href="/home">
            <IonIcon size='large' style={{ bottom: "-20px" }} icon={selectedTab === 'home' ? homeSharp : homeOutline} color={selectedTab === 'hank' ? "primary" : "primary"} />
          </IonTabButton>

          <IonTabButton className={context.darkMode ? "tab-dark" : "tab-light"} tab="events" href="/events">
            <IonIcon size='large' icon={selectedTab === 'events' ? calendarSharp : calendarOutline} color={selectedTab === 'hank' ? "primary" : "primary"} />
          </IonTabButton>

          <IonTabButton tab="hank" href="/hank">
            {selectedTab === 'hank' ? <ForestIcon fontSize='large' style={{ fill: '#61dbfb' }} /> : <ForestOutlinedIcon fontSize='large' style={{ fill: '#61dbfb' }} />}
          </IonTabButton>

          <IonTabButton className={context.darkMode ? "tab-dark" : "tab-light"} tab="maps" href="/maps">
            <IonIcon size='large' icon={selectedTab === 'maps' ? mapSharp : mapOutline} color={selectedTab === 'hank' ? "primary" : "primary"} />
          </IonTabButton>

          <IonTabButton className={context.darkMode ? "tab-dark" : "tab-light"} tab="settings" href="/settings">
            <IonIcon size='large' icon={selectedTab === 'settings' ? personSharp : personOutline} color={selectedTab === 'hank' ? "primary" : "primary"} />
          </IonTabButton>
        </IonTabBar>

      </IonTabs>
    </ToastProvider>
  )
};


/**
 * Main App starting point
 * Provides context wrapper for setting dark mode, tabs, etc.
 * @returns Rendered application
 */
const App: React.FC = () => {
  // hooks
  const context = useContext();

  /**
   * @description Runs on app startup.
   * Enables dark mode if it had been enabled previously.
   * Dark mode is enabled by default on iOS devices.
   */
  const handleDarkMode = React.useCallback(async () => {
    // const isChecked = await Preferences.get({ key: "darkMode" });
    // console.log(isChecked);
    // if (isChecked.value === "false") {
    //   context.setDarkMode(false);
    //   if (Capacitor.getPlatform() === 'ios') {
    //     Keyboard.setStyle(keyStyleOptionsLight);
    //     StatusBar.setStyle({ style: Style.Light });
    //   }
    // } else if (!isChecked || !isChecked.value) {
    document.body.classList.toggle("dark");
    context.setDarkMode(true);
    if (Capacitor.getPlatform() === 'ios') {
      Keyboard.setStyle(keyStyleOptionsDark);
      StatusBar.setStyle({ style: Style.Dark });
    }
    // }
  }, []);

  /**
   * @description Runs on app startup.
   * Enables school color toggle if it had been enabled previously
   */
  const handleSchoolColorToggle = React.useCallback(async () => {
    // const isChecked = await Preferences.get({ key: "schoolColorToggled" });
    // if (isChecked.value === "false" || !isChecked.value) {
    //   context.setSchoolColorToggled(false);
    // } else {
    //   context.setSchoolColorToggled(true);
    // }
    context.setSchoolColorToggled(false);
  }, []);

  /**
   * @description Runs on app startup.
   * Enables post sensitivity if it had been enabled previously
   */
  const handleSensitityToggle = React.useCallback(async () => {
    const isChecked = await Preferences.get({ key: "sensitivityToggled" });
    if (isChecked.value === "false") {
      context.setSensitivityToggled(false);
    } else {
      context.setSensitivityToggled(true);
    }
  }, []);

  /**
   * @description A function that will check permissions for push notifications on iOS.
   * If accepted, user will be registered to receive push notifications
   * and will be assigned a unique token to identify them . 
   * Uses Google FCM to send push notifications.
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
   * temp function to set school name to Cal Poly Humboldt
   */
  const setSchoolName = React.useCallback(async () => {
    await Preferences.set({ key: "school", value: "Cal Poly Humboldt" });
  }, []);

  /**
   * Dark mode use effect
   */
  useEffect(() => {
    setSchoolName().catch((err) => console.log(err));
    handleDarkMode().catch((err) => { console.log(err); })
    handleSchoolColorToggle().catch((err) => { console.log(err); })
    handleSensitityToggle().catch((err) => { console.log(err); })
    if (Capacitor.getPlatform() === 'ios') {
      registerNotifications();
    }
  }, []);

  /**
   * Google Sign In initialization use effect
   */
  useEffect(() => {
    if (Capacitor.getPlatform() === 'ios') {
      GoogleAuth.initialize({
        clientId: '461090594003-0tamr6ksiqhibofup8tfvmet7mbihi50.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  /**
   * Main App
   */
  return (
    <IonApp>
      <IonReactRouter history={historyInstance}>
        <RoutingSystem />
      </IonReactRouter>
    </IonApp>
  )
};

export default App;

