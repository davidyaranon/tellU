import { Route, Redirect, useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  IonApp,
  IonTabs,
  IonPage,
  IonRouterOutlet,
  IonSpinner,
  setupIonicReact,
  IonTabBar,
  IonTabButton,
  IonLoading,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { SplashScreen } from "@capacitor/splash-screen";
import { Storage } from "@ionic/storage";

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
import { useAuthState } from "react-firebase-hooks/auth";

import HomeTwoToneIcon from "@mui/icons-material/HomeTwoTone";
import AccountCircleTwoToneIcon from "@mui/icons-material/AccountCircleTwoTone";
import GroupsIcon from "@mui/icons-material/Groups";
import MapIcon from "@mui/icons-material/Map";
import { db, getCurrentUser, getAllPosts, promiseTimeout } from "./fbconfig";
import auth from './fbconfig';
import { doc, getDoc } from "firebase/firestore";
import { setUserState } from "./redux/actions";
import { App as androidApp } from "@capacitor/app";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useDispatch } from "react-redux";
import { setDarkMode } from "./redux/actions";
import { Keyboard, KeyboardStyle, KeyboardStyleOptions,} from "@capacitor/keyboard";
import { StatusBar, Style } from '@capacitor/status-bar';
import { PushNotificationSchema, PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Post } from "./pages/Post";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";

setupIonicReact();

const RoutingSystem: React.FunctionComponent = () => {
  const { showTabs } = React.useContext(UIContext);
  let tabBarStyle = showTabs ? undefined : { display: "none" };
  useEffect(() => {}, []);
  return (
    <ToastProvider value={{ color: "primary", duration: 2000 }}>
      <IonReactRouter>
        <IonPage id="app">
          <IonTabs>
            <IonRouterOutlet>
              <Route path="/:tab(home)" exact={true}>
                {" "}
                <Home />{" "}
              </Route>
              <Route path="/:tab(home)/post/:key" component={Post} />
              <Route path="/:tab(home)/about/:uid" component={UserProfile} />
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
              <Route path="/register" component={Register} exact={true} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/404" component={RedirectComponent} />
              <Route
                exact
                path="/"
                render={() => <Redirect to="/landing-page" />}
              />
              {/* <Route component={RedirectComponent} /> */}
            </IonRouterOutlet>
            <IonTabBar slot="bottom" style={tabBarStyle}>
              <IonTabButton tab="home" href="/home">
                <HomeTwoToneIcon
                  fontSize="large"
                  style={{ fontSize: "4.10vh" }}
                />
              </IonTabButton>
              <IonTabButton tab="community" href="/community">
                <GroupsIcon fontSize="large" style={{ fontSize: "4.10vh" }} />
              </IonTabButton>
              <IonTabButton tab="maps" href="/maps">
                <MapIcon fontSize="large" style={{ fontSize: "4.10vh" }} />
              </IonTabButton>
              <IonTabButton tab="user" href="/user">
                <AccountCircleTwoToneIcon
                  fontSize="large"
                  style={{ fontSize: "4.10vh" }}
                />
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonPage>
      </IonReactRouter>
    </ToastProvider>
  );
};

const App: React.FunctionComponent = () => {
  const [busy, setBusy] = useState(true);
  const Toast = useToast();
  const dispatch = useDispatch();
  const history = useHistory();
  const darkMode = localStorage.getItem("darkMode") || "false";
  const keyStyleOptionsDark : KeyboardStyleOptions  =  {
    style : KeyboardStyle.Dark
  }
  const keyStyleOptionsLight : KeyboardStyleOptions  =  {
    style : KeyboardStyle.Light
  }
  useEffect(() => {
    if (darkMode == "false") {
      dispatch(setDarkMode(false));
      Keyboard.setStyle(keyStyleOptionsLight);
      StatusBar.setStyle({ style: Style.Dark });
    } else {
      document.body.classList.toggle("dark");
      dispatch(setDarkMode(true));
      Keyboard.setStyle(keyStyleOptionsDark);
      StatusBar.setStyle({ style: Style.Dark });
    }
    const hasLoadedUser = promiseTimeout(10000, getCurrentUser());
    hasLoadedUser.then((user : any) => {
      if (user) {
        let school = "";
        const userRef = doc(db, "userData", user.uid);
        const docLoaded = promiseTimeout(10000, getDoc(userRef));
        docLoaded.then((userSnap) => {
            if (userSnap.exists()) {
              school = userSnap.data().school;
            }
            dispatch(setUserState(user.displayName, user.email, false, school));
            setBusy(false);
            window.history.replaceState({}, "", "/home");
          });
          docLoaded.catch((err) => {
            console.log(err);
            dispatch(setUserState(user.displayName, user.email, false, ""));
            setBusy(false);
            window.history.replaceState({}, "", "/home");
          });
      } else {
        setBusy(false);
        window.history.replaceState({}, "", "/landing-page");
      }
    });
    hasLoadedUser.catch((err : any) => {
      console.log(err);
      Toast.error(err);
      setBusy(false);
      window.history.replaceState({}, "", "/landing-page");
    });
  }, []);
  return (
    <IonApp>
      {busy ? (
        <IonSpinner class="ion-spinner" name="dots" color="primary" />
      ) : (
        <RoutingSystem />
      )}
    </IonApp>
  );
};

export default App;
