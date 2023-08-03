// Ionic/Capacitor + React
import React from 'react';
import { useHistory } from 'react-router';
import { IonAvatar, IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonRow, IonSkeletonText, IonSpinner, useIonRouter, useIonToast, useIonViewWillEnter } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { Keyboard, KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";
import { Dialog } from '@capacitor/dialog';
import { SplashScreen } from '@capacitor/splash-screen';
import { useAuthState } from 'react-firebase-hooks/auth';

// Firebase/Google
import auth, { db, downVote, getAllPostsNextBatch, getAppVersionNum, getLikes, promiseTimeout, storage, updateAchievements, upVote } from '../fbConfig';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';

// Other imports/components
import { useContext } from '../my-context';
import { MakePost } from '../components/Home/MakePost';
import { NewPostsButton } from '../components/Home/NewPostsButton';
import { ProgressBar } from '../components/Home/ProgressBar';
import { dynamicNavigate } from '../components/Shared/Navigation';
import { timeout } from '../helpers/timeout';
import { HomePagePost } from '../components/Home/HomePagePost';
import { HomePagePoll } from '../components/Home/HomePagePoll';
import TellUHeader, { ionHeaderStyle } from "../components/Shared/Header";

import { Virtuoso } from 'react-virtuoso';
import { useToast } from '@agney/ir-toast';
import FadeIn from 'react-fade-in/lib/FadeIn';

// CSS
import '../App.css';
import { Haptics, ImpactStyle } from '@capacitor/haptics';


const versionNum: string = '4.0';

const Home: React.FC = () => {

  // hooks
  const Toast = useToast();
  const context = useContext();
  const router = useIonRouter();
  const history = useHistory();
  const [present] = useIonToast();
  const virtuosoRef = React.useRef<any>(null);
  const [user, loading, error] = useAuthState(auth);

  // state variables
  const [postLikes, setPostLikes] = React.useState<any[]>([]);
  const [postDislikes, setPostDislikes] = React.useState<any[]>([]);
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

  const presentAchievement = async (achievement: string): Promise<void> => {
    const achStr = achievement.replace(/\s+/g, '');
    await Preferences.set({ "key": achStr, value: "true" });
    present({
      message: 'You just unlocked the ' + achievement + ' achievement!',
      duration: 3500,
      position: 'top',
      buttons: [
        {
          text: 'Open',
          role: 'info',
          handler: () => { history.push('/achievements'); }
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
   * @description upvotes a post and updates the state
   * 
   * @param {string} postKey the Firestore key of the post
   * @param {number} index the index of the post in the posts array
   * @param {any} post the post object used for updating user's likes document
  */
  const handleUpVote = async (postKey: string, index: number, post: any) => {
    let checkLikeAchievement = true;
    const likeALotAchievement = await Preferences.get({ key: "Like-a-Lot" });
    if (likeALotAchievement && likeALotAchievement.value === "true") {
      checkLikeAchievement = false;
    }
    const { inc: val, upVoteAchievement } = await upVote(postKey, post, checkLikeAchievement);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (user) {
        let likesCopy: any = { ...postLikes };
        let dislikesCopy: any = { ...postDislikes };
        if (likesCopy[index][user.uid]) {
          delete likesCopy[index][user.uid];
        } else {
          if (dislikesCopy[index][user.uid]) {
            delete dislikesCopy[index][user.uid];
          }
          likesCopy[index][user.uid] = true;
        }
        setPostLikes(likesCopy);
        setPostDislikes(dislikesCopy);
        await timeout(250);
      }
    } else {
      const toast = Toast.create({ message: 'Unable to like post', duration: 2000, color: 'toast-error' });
      toast.present();
    }
    if (upVoteAchievement) {
      await presentAchievement("Like-a-Lot");
    }
  };

  /**
   * @description downvotes a post and updates the state
   * 
   * @param {string} postKey the Firestore key of the post
   * @param {number} index the index of the post in the posts array
   */
  const handleDownVote = async (postKey: string, index: number) => {
    const val = await downVote(postKey);
    if (val && (val === 1 || val === -1)) {
      if (val === 1) {
        Haptics.impact({ style: ImpactStyle.Light });
      }
      if (user) {
        let likesCopy: any = { ...postLikes };
        let dislikesCopy: any = { ...postDislikes };
        if (dislikesCopy[index][user.uid]) {
          delete dislikesCopy[index][user.uid];
        } else {
          if (likesCopy[index][user.uid]) {
            delete likesCopy[index][user.uid];
          }
          dislikesCopy[index][user.uid] = true;
        }
        setPostLikes(likesCopy);
        setPostDislikes(dislikesCopy);
        const pickyScholarAchievement = await Preferences.get({ key: "PickyScholar" });
        if((!pickyScholarAchievement) || pickyScholarAchievement.value !== 'true') {
          await updateAchievements("Picky Scholar");
          await presentAchievement("Picky Scholar");
        }
        await timeout(250);
      }
    } else {
      const toast = Toast.create({ message: 'Unable to dislike post', duration: 2000, color: 'toast-error' });
      toast.present();
    }
  };

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
        } else {
          const toast = Toast.create({ message: 'Unable to load posts', duration: 2000, color: 'toast-error' });
          toast.present();
        }
      });
      tempPosts.catch((err: any) => {
        const toast = Toast.create({ message: err || "", duration: 2000, color: 'toast-error' });
        toast.present();
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
  };

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
  };

  /**
   * tellU logo header
   */
  const Header = React.memo(() => {
    return (
      <>
        <IonHeader className="ion-no-border" style={ionHeaderStyle} >
          <TellUHeader darkMode={context.darkMode} schoolName={schoolName} zoom={1} />
        </IonHeader>
      </>
    )
  });

  /**
   * The infinite loading footer component
   * 
   * @returns a string that says "Loading..." if there are more posts to load, otherwise an empty string
   */
  const Footer = () => {
    return (
      <FadeIn>
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }} >
          {!noMorePosts ? "Loading..." : ""}
        </div>
      </FadeIn>
    )
  };

  /**
   * Loads school from local storage (Preferences API).
   * Currently just defaults to Cal Poly Humboldt.
   * 
   * @todo TODO: Add support for all other schools.
   */
  const setSchool = React.useCallback(async () => {
    const school = await Preferences.get({ key: 'school' });
    if (school && school.value) {
      setSchoolName(school.value);
    } else {
      const toast = Toast.create({ message: "Error connecting to tellU servers, try logging out and logging back in", color: "toast-error" });
      toast.present();
    }
  }, []);

  const handleSetLikes = React.useCallback(() => {
    if (posts) {
      let likes: any[] = [];
      for (let i = 0; i < posts.length; i++) {
        if ("likes" in posts[i]) {
          likes.push(posts[i].likes);
        }
      }
      setPostLikes(likes);
      // console.log(likes);
    }
  }, [posts]);


  const handleSetDislikes = React.useCallback(() => {
    if (posts) {
      let dislikes: any[] = [];
      for (let i = 0; i < posts.length; i++) {
        if ("dislikes" in posts[i]) {
          dislikes.push(posts[i].dislikes);
        }
      }
      setPostDislikes(dislikes);
    }
  }, [posts]);

  React.useEffect(() => {
    if (posts) {
      handleSetLikes();
      handleSetDislikes();
    }
  }, [posts]);

  React.useEffect(() => {
    context.setInitLoad(true);
  }, []);

  // React.useEffect(() => {
  //   context.setDarkMode(true);
  //   document.body.classList.toggle("dark");
  //   context.setDarkMode(true);
  //   if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'ios') {
  //     Keyboard.setStyle(keyStyleOptionsDark);
  //     StatusBar.setStyle({ style: Style.Dark });
  //   }
  // }, []);

  const hideSplashScreen = React.useCallback(async () => {
    await timeout(250);
    SplashScreen.hide();
  }, []);

  // useIonViewWillEnter(() => {
  //   if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'ios') {
  //     StatusBar.setStyle({ style: Style.Dark })
  //   }
  // });

  useIonViewWillEnter(() => {
    if (context.showTabs === false) {
      context.setShowTabs(true);
    }
  });

  React.useEffect(() => {
    hideSplashScreen();
  }, []);

  React.useEffect(() => {
    setSchool();
  }, [setSchool]);

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

  React.useEffect(() => {
    if (posts && posts.length < 15) {
      setNoMorePosts(true);
    } else {
      setNoMorePosts(false);
    }
  }, [posts]);


  React.useEffect(() => {
    if (!loading && !user) {
      dynamicNavigate(router, '/landing-page', 'root');
      history.replace('/landing-page');
    } else {
      console.log("USER LOADED " + user?.displayName);
      if (user && "uid" in user && user.uid && user.uid.length > 0) {
        getDownloadURL(ref(storage, "profilePictures/" + user.uid + "photoURL")).then((res) => {
          // console.log(res);
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
    // console.log(school);
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
            // console.log(finalData);
            await timeout(500);
            // try {
            if (postsRef.current)
              setPosts([...finalData, ...postsRef.current]);
            else
              setPosts([...finalData]);
            // } catch (err) {
            //   window.location.reload();
            // }
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
          // console.log("INIT LOAD")
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
        }
      }
    });
    return () => { unsubscribe(); };
  }, [user, loading, schoolName]);

  return (
    <IonPage className="ion-page-ios-notch">
      {schoolName &&
        <div>
          {newPostsLoaded && <NewPostsButton schoolName={schoolName} handleNewPostsButtonClicked={handleNewPostsButtonClicked} />}
          {showProgressBar && <ProgressBar schoolName={schoolName} />}
        </div>
      }
      <IonContent fullscreen scrollY={posts && posts.length > 0 && schoolName ? false : true}>
        {posts && posts.length > 0 && schoolName ?
          <Virtuoso
            ref={virtuosoRef}
            overscan={950}
            endReached={handleLoadPostsNextBatch}
            className="ion-content-scroll-host"
            totalCount={posts.length}
            itemContent={(item) => {
              let index = item;
              let post = posts[index];
              let likes = postLikes[index] || {};
              let dislikes = postDislikes[index] || {};
              if ("question" in post) {
                return (
                  <HomePagePoll updatePosts={updatePosts} postIndex={index} post={post} user={user} schoolName={schoolName} />
                )
              }
              return (
                <HomePagePost handleDownVote={handleDownVote} handleUpVote={handleUpVote} likes={likes} dislikes={dislikes} schoolName={schoolName} user={user} index={index} post={post} />
              );
            }}
            style={{ height: "100%" }}
            components={{ Header, Footer }}
          />
          :
          <>
            <Header />
            <IonList inset mode="ios" >
              <IonItem lines="none" mode="ios">
                <IonLabel>
                  <IonRow>
                    <IonAvatar class="posts-avatar">
                      <IonSkeletonText animated />
                    </IonAvatar>
                    <p style={{ color: "var(--ion-color-light)", padding: "10px", fontWeight: 'bold' }}>
                      <IonSkeletonText animated style={{ width: "35vw", height: "2.5vh" }} />
                    </p>
                  </IonRow>
                  <div style={{ height: "1vh" }} />
                  <p className="h2-message">
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonList inset mode="ios" >
              <IonItem lines="none" mode="ios">
                <IonLabel>
                  <IonRow>
                    <IonAvatar class="posts-avatar">
                      <IonSkeletonText animated />
                    </IonAvatar>
                    <p style={{ color: "var(--ion-color-light)", padding: "10px", fontWeight: 'bold' }}>
                      <IonSkeletonText animated style={{ width: "35vw", height: "2.5vh" }} />
                    </p>
                  </IonRow>
                  <div style={{ height: "1vh" }} />
                  <p className="h2-message">
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonList inset mode="ios" >
              <IonItem lines="none" mode="ios">
                <IonLabel>
                  <IonRow>
                    <IonAvatar class="posts-avatar">
                      <IonSkeletonText animated />
                    </IonAvatar>
                    <p style={{ color: "var(--ion-color-light)", padding: "10px", fontWeight: 'bold' }}>
                      <IonSkeletonText animated style={{ width: "35vw", height: "2.5vh" }} />
                    </p>
                  </IonRow>
                  <div style={{ height: "1vh" }} />
                  <p className="h2-message">
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonList inset mode="ios" >
              <IonItem lines="none" mode="ios">
                <IonLabel>
                  <IonRow>
                    <IonAvatar class="posts-avatar">
                      <IonSkeletonText animated />
                    </IonAvatar>
                    <p style={{ color: "var(--ion-color-light)", padding: "10px", fontWeight: 'bold' }}>
                      <IonSkeletonText animated style={{ width: "35vw", height: "2.5vh" }} />
                    </p>
                  </IonRow>
                  <div style={{ height: "1vh" }} />
                  <p className="h2-message">
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonList inset mode="ios" >
              <IonItem lines="none" mode="ios">
                <IonLabel>
                  <IonRow>
                    <IonAvatar class="posts-avatar">
                      <IonSkeletonText animated />
                    </IonAvatar>
                    <p style={{ color: "var(--ion-color-light)", padding: "10px", fontWeight: 'bold' }}>
                      <IonSkeletonText animated style={{ width: "35vw", height: "2.5vh" }} />
                    </p>
                  </IonRow>
                  <div style={{ height: "1vh" }} />
                  <p className="h2-message">
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                    <IonSkeletonText animated />
                  </p>
                </IonLabel>
              </IonItem>
            </IonList>
          </>
        }
      </IonContent>

      <MakePost user={user} schoolName={schoolName} profilePhoto={profilePhoto} handleSetShowProgressBar={handleSetShowProgressBar} />

    </IonPage>
  );

};

export default Home;

