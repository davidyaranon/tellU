// Ionic/Capacitor + React
import React from 'react';
import { IonContent, IonHeader, IonPage, IonSpinner, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { Keyboard, KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";

// Firebase/Google
import auth, { db, getAllPostsNextBatch, getAppVersionNum, getLikes, promiseTimeout, storage } from '../fbConfig';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';

// Other imports/components
import { Virtuoso } from 'react-virtuoso';
import { useToast } from '@agney/ir-toast';
import { useContext } from '../my-context';
import { timeout } from '../helpers/timeout';
import { useAuthState } from 'react-firebase-hooks/auth';
import { HomePagePost } from '../components/Home/HomePagePost';
import { HomePagePoll } from '../components/Home/HomePagePoll';
import TellUHeader, { ionHeaderStyle } from "../components/Shared/Header";

// CSS
import '../App.css';
import '../theme/variables.css';
import '../theme/custom-tab-bar.css';
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
import { MakePost } from '../components/Home/MakePost';
import { NewPostsButton } from '../components/Home/NewPostsButton';
import { ProgressBar } from '../components/Home/ProgressBar';
import { getDownloadURL, ref } from 'firebase/storage';
import { SplashScreen } from '@capacitor/splash-screen';
import { dynamicNavigate } from '../components/Shared/Navigation';
import FadeIn from 'react-fade-in/lib/FadeIn';
import { useHistory } from 'react-router';
import { Dialog } from '@capacitor/dialog';
import { Capacitor } from '@capacitor/core';

const versionNum: string = '3.2.0';
const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
}

const Home: React.FC = () => {

  // hooks
  const Toast = useToast();
  const context = useContext();
  const router = useIonRouter();
  const history = useHistory();
  const virtuosoRef = React.useRef<any>(null);
  const [user, loading, error] = useAuthState(auth);

  // state variables
  const [schoolName, setSchoolName] = React.useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);
  const [lastKey, setLastKey] = React.useState<string>("");
  const [noMorePosts, setNoMorePosts] = React.useState(false);
  const [showProgressBar, setShowProgressBar] = React.useState<boolean>(false);

  const [posts, setPosts] = React.useState<any[] | null>(null);
  const [newPostsLoaded, setNewPostsLoaded] = React.useState<boolean>(false);
  const postsRef = React.useRef<any>();
  postsRef.current = posts;
  const [newData, setNewData] = React.useState<any[] | null>(null);
  const newDataRef = React.useRef<any>();
  newDataRef.current = newData;

  /**
   * @description runs when the New Posts button is clicked
   * Sets posts state to the new posts and scrolls to the top
   */
  const handleNewPostsButtonClicked = React.useCallback(() => {
    setPosts([...newDataRef.current, ...postsRef.current]);
    virtuosoRef && virtuosoRef.current && virtuosoRef.current.scrollTo({ top: 0, behavior: "auto" })
    setNewPostsLoaded(false);
    setNewData([]);
  }, []);

  /**
   * @description loads the next 15 posts from Firestore
   * 
   * @param event IonInfiniteScroll event
   */
  const handleLoadPostsNextBatch = async (event: any) => {
    if (lastKey && user && schoolName) {
      await timeout(500);
      let tempPosts = promiseTimeout(20000, getAllPostsNextBatch(schoolName, lastKey));
      tempPosts.then(async (res: any) => {
        if (res.allPosts) {
          for (let i = 0; i < res.allPosts.length; ++i) {
            const data = await getLikes(res.allPosts[i].key);
            if (data) {
              res.allPosts[i].likes = data.likes;
              res.allPosts[i].dislikes = data.dislikes;
              res.allPosts[i].commentAmount = data.commentAmount;
            } else {
              res.allPosts[i].likes = {};
              res.allPosts[i].dislikes = {};
              res.allPosts[i].commentAmount = 0;
            }
          }
          setPosts(posts?.concat(res.allPosts)!);
          setLastKey(res.lastKey);
          // if (event)
          //   event.target.complete();
        } else {
          const toast = Toast.create({ message: 'Unable to load posts', duration: 2000, color: 'toast-error' });
          toast.present();
        }
        // setBusy(false);
      });
      tempPosts.catch((err: any) => {
        const toast = Toast.create({ message: err || "", duration: 2000, color: 'toast-error' });
        toast.present();
        // setBusy(false);
        setPosts(null);
      });
    } else {
      setNoMorePosts(true);
    }
  };

  /**
   * @description shows progress bar when uploading a new post/poll
   * 
   * @param val boolean value to set showProgressBar state
   */
  const handleSetShowProgressBar = (val: boolean) => {
    setShowProgressBar(val)
  }

  /**
   * @description handles state update of posts array from child components
   * 
   * @param {any} newPost the post being added / updated in posts array
   * @param {number} index the index of the post in the posts array
   */
  const updatePosts = (newPost: any, index: number) => {
    if (posts) {
      let tempPosts: any[] = [...posts];
      tempPosts[index] = newPost;
      setPosts(tempPosts);
    } else {
      const toast = Toast.create({ message: 'Something went wrong when updating posts', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  }

  /**
   * tellU logo header
   */
  const Header = React.memo(() => {
    return (
      <>
        <IonHeader style={ionHeaderStyle} >
          <TellUHeader darkMode={context.darkMode} colorPallete={context.schoolColorToggled} schoolName={schoolName} zoom={1} />
        </IonHeader>
      </>
    )
  });

  /**
   * The infinite loading footer compontent
   * 
   * @returns a string that says "Loading..." if there are more posts to load, otherwise an empty string
   */
  const Footer = () => {
    return (
      <FadeIn delay={500}>
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }} >
          {!noMorePosts ? "Loading..." : ""}
        </div>
      </FadeIn>
    )
  }

  /**
   * Loads school from local storage (Preferences API)
   */
  const setSchool = React.useCallback(async () => {
    const school = await Preferences.get({ key: 'school' });
    if (school && school.value) {
      setSchoolName(school.value);
    } else {
      setSchoolName('Cal Poly Humboldt');
      await Preferences.set( {key : "school", value: "Cal Poly Humboldt" } );
    }
  }, []);

  React.useEffect(() => {
    context.setDarkMode(true);
    document.body.classList.toggle("dark");
    context.setDarkMode(true);
    if (Capacitor.getPlatform() === 'ios') {
      Keyboard.setStyle(keyStyleOptionsDark);
      StatusBar.setStyle({ style: Style.Dark });
    }
  }, []);

  const hideSplashScreen = React.useCallback(async () => {
    await timeout(250);
    SplashScreen.hide();
  }, []);

  /**
   * Hides splash screen on mount
   */
  React.useEffect(() => {
    hideSplashScreen();
  }, []);

  /**
   * Calls setSchool on mount
   */
  React.useEffect(() => {
    setSchool();
  }, [setSchool]);

  /**
   * Sets the showTabs variable in the context to true
   */
  useIonViewWillEnter(() => {
    if (context.showTabs === false) {
      context.setShowTabs(true);
    }
  });

  const handleGetVersion = React.useCallback(async () => {
    const serverVersion: null | string = await getAppVersionNum();
    if (serverVersion !== versionNum) {
      await Dialog.alert({
        title: "App Update Available",
        message: 'Consider updating to the latest version of tellU!',
      });
    }
  }, [])

  React.useEffect(() => {
    handleGetVersion();
  }, []);

  useIonViewWillEnter(() => {
    if (Capacitor.getPlatform() === 'ios')
      StatusBar.setStyle({ style: Style.Dark })
  });

  /**
   * Firestore listener for new posts, loads 15 posts at a time
   */
  React.useEffect(() => {
    if (!loading && !user) {
      dynamicNavigate(router, '/landing-page', 'root');
      history.replace('/landing-page');
    } else {
      if (user && "uid" in user && user.uid && user.uid.length > 0) {
        getDownloadURL(ref(storage, "profilePictures/" + user.uid + "photoURL")).then((res) => {
          console.log(res);
          setProfilePhoto(res);
        }).catch(() => {
          setProfilePhoto("https://firebasestorage.googleapis.com/v0/b/quantum-61b84.appspot.com/o/profilePictures%2F301-3012952_this-free-clipart-png-design-of-blank-avatar.png?alt=media&token=90117292-9497-4b30-980e-2b17986650cd",
          )
        });
      }
    }
    let school = "blank";
    if (schoolName) {
      school = schoolName.toString().replace(/\s+/g, "");
    }
    const q = query(collection(db, "schoolPosts", school, "allPosts"), orderBy("timestamp", "desc"), limit(15));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data: any = [];
      for (let i = 0; i < snapshot.docChanges().length; ++i) {
        let change = snapshot.docChanges()[i];
        if (auth && auth.currentUser && auth.currentUser.uid) {
          if ((change.type === "added") && change.doc.data().uid === auth.currentUser.uid && snapshot.docChanges().length === 2) {
            let datasCopy = newDataRef.current || [];
            let justAdded: any[] = [];
            for (let i = 0; i < datasCopy.length; ++i) {
              datasCopy[i].likes = { 'null': true };
              datasCopy[i].dislikes = { 'null': true };
              datasCopy[i].commentAmount = 0;
            }
            justAdded.push({
              ...change.doc.data(),
              key: change.doc.id
            });
            justAdded[0].likes = { 'null': true };
            justAdded[0].dislikes = { 'null': true };
            justAdded[0].commentAmount = 0;
            const finalData: any[] = justAdded.concat(datasCopy);
            await timeout(500);
            try {
              setPosts([...finalData, ...postsRef.current]);
            } catch (err) {
              window.location.reload();
            }
            virtuosoRef && virtuosoRef.current && virtuosoRef.current.scrollTo({ top: 0, behavior: "auto" })
            setNewPostsLoaded(false);
            setNewData([]);
            break;
          }
        }

        if (change.type === "added") {
          data.push({
            ...change.doc.data(),
            key: change.doc.id,
          });
        }

      }
      if (data.length > 0) {
        if (postsRef.current) {
          for (let i = 0; i < data.length; ++i) {
            const likesData = await getLikes(data[i].key);
            if (likesData) {
              data[i].likes = likesData.likes;
              data[i].dislikes = likesData.dislikes;
              data[i].commentAmount = likesData.commentAmount;
            } else {
              data[i].likes = { 'null': true };
              data[i].dislikes = { 'null': true };
              data[i].commentAmount = 0;
            }
          }
          if (newDataRef.current) {
            setNewData([...data, ...newDataRef.current])
          } else {
            setNewData(data);
          }
          setNewPostsLoaded(true);
        } else { // on initial load
          for (let i = 0; i < data.length; ++i) {
            const likesData = await getLikes(data[i].key);
            if (likesData) {
              data[i].likes = likesData.likes;
              data[i].dislikes = likesData.dislikes;
              data[i].commentAmount = likesData.commentAmount;
            } else {
              data[i].likes = { 'null': true };
              data[i].dislikes = { 'null': true };
              data[i].commentAmount = 0;
            }
          }
          setPosts(data);
          setLastKey(data[data.length - 1].timestamp);
          // tabs.setShowTabs(true);
        }
      }
    });
    return () => { unsubscribe(); };
  }, [user, loading, schoolName]);

  /**
   * Main page
   */
  if (posts && posts.length > 0 && schoolName) {
    return (
      <IonPage className="ion-page-ios-notch">
        <div>
          {newPostsLoaded && <NewPostsButton schoolName={schoolName} handleNewPostsButtonClicked={handleNewPostsButtonClicked} />}
          {showProgressBar && <ProgressBar schoolName={schoolName} />}
        </div>

        <IonContent fullscreen scrollY={false}>
          <Virtuoso
            ref={virtuosoRef}
            overscan={1000}
            endReached={handleLoadPostsNextBatch}
            className="ion-content-scroll-host"
            totalCount={posts.length}
            itemContent={(item) => {
              let index = item;
              let post = posts[index];
              if ("question" in post) {
                return (
                  <HomePagePoll updatePosts={updatePosts} postIndex={index} post={post} user={user} schoolName={schoolName} />
                )
              }
              return (
                <HomePagePost schoolName={schoolName} user={user} index={index} post={post} />
              );
            }}
            style={{ height: "100%" }}
            components={{ Header, Footer }}
          />
        </IonContent>

        <MakePost user={user} schoolName={schoolName} profilePhoto={profilePhoto} handleSetShowProgressBar={handleSetShowProgressBar} />

      </IonPage>
    );
  }

  /**
   * Loading spinner
   */
  return (
    <IonPage>
      <div className="ion-spinner">
        <IonSpinner color={schoolName === "Cal Poly Humboldt" && context.schoolColorToggled ? "tertiary" : "primary"} />
      </div>
    </IonPage>
  );

};

export default Home;

