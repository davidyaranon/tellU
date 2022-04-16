import { Route, Redirect} from 'react-router-dom';
import React, { useState, useEffect } from 'react'
import { IonApp, IonTabs, IonPage, IonRouterOutlet, IonSpinner, setupIonicReact, IonTabBar, IonTabButton, IonLoading} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { SplashScreen } from '@capacitor/splash-screen';
import { Storage } from '@ionic/storage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './App.css'

import Home from './pages/Home';
import Workshops from './pages/Workshops';
import Maps from './pages/Maps';
import User from './pages/User';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import RedirectComponent from './pages/RedirectComponent';

import  UIContext from './my-context'
import { ToastProvider, useToast } from "@agney/ir-toast";
import { useAuthState } from "react-firebase-hooks/auth";

import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import GroupsIcon from '@mui/icons-material/Groups';
import MapIcon from '@mui/icons-material/Map';
import { db, getCurrentUser, auth, getAllPosts } from './fbconfig';
import { setUserState } from './redux/actions';
import { App as androidApp } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useDispatch } from "react-redux"
import { setDarkMode} from './redux/actions';
import { animationBuilder } from './components/animationBuilder';

setupIonicReact();

androidApp.addListener('backButton', ({ canGoBack }) => {
  if(!canGoBack) {
    androidApp.exitApp();
  } else {
    window.history.back();
  }
});

const RoutingSystem: React.FunctionComponent = () => {
  const { showTabs } = React.useContext(UIContext);
  const [user] = useAuthState(auth);
  const Toast = useToast();
  let tabBarStyle = showTabs ? undefined: { display: "none"};
  useEffect(() => {
  }, [])
  return ( 
    <ToastProvider value={{ color: 'primary', duration: 2000 }}>
    <IonReactRouter>
      <IonPage id="app">
        <IonTabs>
            <IonRouterOutlet animation={animationBuilder}>
              <Route path="/:tab(home)" exact={true}> <Home /> </Route>
              <Route path="/:tab(workshops)" component={Workshops} exact={true} />
              <Route path="/:tab(maps)" component={Maps} exact={true} />
              <Route path="/:tab(user)" exact={true} > <User/> </Route>
              <Route path="/landing-page" exact={true}> <LandingPage /> </Route>
              <Route path="/register" component={Register} exact={true} />
              <Route exact path="/" render={() => <Redirect to="/landing-page" />} />
              <Route component={RedirectComponent} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom" style={tabBarStyle}>
              <IonTabButton tab="home" href="/home">
                <HomeTwoToneIcon fontSize="large" style={{fontSize: '4.10vh'}}/>
              </IonTabButton>
              <IonTabButton tab="workshops" href="/workshops">
                <GroupsIcon fontSize="large" style={{fontSize: '4.10vh'}} />
              </IonTabButton>
              <IonTabButton tab="maps" href="/maps">
                <MapIcon fontSize="large" style={{fontSize: '4.10vh'}} />
              </IonTabButton>
              <IonTabButton tab="user" href="/user">
                <AccountCircleTwoToneIcon fontSize="large" style={{fontSize: '4.10vh'}} />
              </IonTabButton>
            </IonTabBar> 
          </IonTabs>
        </IonPage>
    </IonReactRouter>
    </ToastProvider>
  )
}

const App: React.FunctionComponent = () => {
  const [busy, setBusy] = useState(true);
  const dispatch = useDispatch();
  const darkMode = localStorage.getItem("darkMode") || "false";
  useEffect(() => {
    SplashScreen.hide();
    if(darkMode == "false") {
      dispatch(setDarkMode(false));
    } else {
      document.body.classList.toggle("dark");
      dispatch(setDarkMode(true));
    }
    getCurrentUser().then( (user : any)  => {
      if(user) {
        dispatch(setUserState(user.displayName, user.email, false));
        setBusy(false);
        window.history.replaceState({}, "", "/home");
      } else {
        setBusy(false);
        window.history.replaceState({}, "", "/landing-page");
      }
      setBusy(false);
    });
  }, [])
    return(
      <IonApp>
        {busy ? <IonSpinner class='ion-spinner' name="dots" color="primary" /> : <RoutingSystem /> }
      </IonApp>
    )
}

export default App;
