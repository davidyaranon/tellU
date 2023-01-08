/* Ionic + React */
import React from "react";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { IonContent, IonPage } from "@ionic/react";

/* Firebase */
import auth, { getLikes, getUserPosts, getNextBatchUserPosts, getUserData, storage } from '../fbConfig';
import { ref, getDownloadURL } from "firebase/storage";
import { getDatabase, goOffline, goOnline } from "firebase/database";

/* CSS + Other Components */
import "../App.css";
import { useToast } from "@agney/ir-toast";
import { Virtuoso } from "react-virtuoso";
import { Toolbar } from '../components/Shared/Toolbar';
import { HomePagePoll } from '../components/Home/HomePagePoll';
import { HomePagePost } from '../components/Home/HomePagePost';
import { UserAboutCard } from '../components/Shared/UserAboutCard';
import FadeIn from "react-fade-in/lib/FadeIn";

interface MatchParams {
  uid: string;
  school: string;
}

export const UserProfile = ({ match }: RouteComponentProps<MatchParams>) => {
  const uid = match.params.uid;
  const schoolName = match.params.school;

  const Toast = useToast();
  const db = getDatabase();
  const history = useHistory();

  const [busy, setBusy] = useState<boolean>(false);
  const [noPostsYet, setNoPostsYet] = useState<boolean>(false);
  const [user, loading, error] = useAuthState(auth);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userBio, setUserBio] = useState<string>("");
  const [userMajor, setUserMajor] = useState<string>("");
  const [userTiktok, setUserTiktok] = useState<string>("");
  const [userSnapchat, setUserSnapchat] = useState<string>("");
  const [userInstagram, setUserInstagram] = useState<string>("");
  const [spotifyUri, setSpotifyUri] = useState<string>("");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [lastKey, setLastKey] = useState<any>();
  const [noMorePosts, setNoMorePosts] = useState<boolean>(false);

  /**
   * Gets the next batch of posts from Firestore once the user scrolls to the bottom of the page
   */
  const fetchMorePosts = () => {
    console.log("fetching more posts");
    if (lastKey) {
      getNextBatchUserPosts(schoolName, uid, lastKey)
        .then(async (res: any) => {
          setLastKey(res.lastKey);
          for (let i = 0; i < res.userPosts.length; ++i) {
            const data = await getLikes(res.userPosts[i].key);
            if (data) {
              res.userPosts[i].likes = data.likes;
              res.userPosts[i].dislikes = data.dislikes;
              res.userPosts[i].commentAmount = data.commentAmount;
            } else {
              res.userPosts[i].likes = {};
              res.userPosts[i].dislikes = {};
              res.userPosts[i].commentAmount = 0;
            }
          }
          setUserPosts(userPosts.concat(res.userPosts));
          // event.target.complete();
          if (res.userPosts.length == 0) {
            setNoMorePosts(true);
          }
        })
        .catch((err) => {
          Toast.error(err.message.toString());
        });
    } else {
      setNoMorePosts(true);
    }
  };

  /**
   * Runs on page load, sets data for the user's profile / posts
   */
  useEffect(() => {
    goOffline(db);
    goOnline(db);
    setUserPosts([]);
    setBusy(true);
    if (!loading && !user) {
      history.replace("/landing-page");
    } else {
      if (uid && schoolName) {
        getUserData(uid)
          .then((res: any) => {
            setUserName(res.userName);
            setUserBio(res.bio);
            setUserMajor(res.major);
            setUserInstagram(res.instagram);
            setUserSnapchat(res.snapchat);
            setUserTiktok(res.tiktok);
            if ("spotify" in res) {
              setSpotifyUri(res.spotify);
            }
            getUserPosts(schoolName, uid)
              .then(async (res: any) => {
                // first batch
                if (res.userPosts.length > 0) {
                  for (let i = 0; i < res.userPosts.length; ++i) {
                    const data = await getLikes(res.userPosts[i].key);
                    if (data) {
                      res.userPosts[i].likes = data.likes;
                      res.userPosts[i].dislikes = data.dislikes;
                      res.userPosts[i].commentAmount = data.commentAmount;
                    } else {
                      res.userPosts[i].likes = {};
                      res.userPosts[i].dislikes = {};
                      res.userPosts[i].commentAmount = 0;
                    }
                  }
                  setUserPosts(res.userPosts);
                  setLastKey(res.lastKey);
                  setNoPostsYet(false);
                } else {
                  setNoPostsYet(true);
                }
              })
              .catch((err) => {
                Toast.error(err.message.toString());
              });
            getDownloadURL(ref(storage, "profilePictures/" + uid + "photoURL"))
              .then((url) => {
                setProfilePhoto(url);
                setBusy(false);
              })
              .catch((err) => {
                if (err.code === "storage/object-not-found") {
                  getDownloadURL(ref(storage, "profilePictures/301-3012952_this-free-clipart-png-design-of-blank-avatar.png"))
                    .then((url) => {
                      setProfilePhoto(url);
                      setBusy(false);
                    })
                    .catch((err) => {
                      Toast.error(err.message.toString());
                    });
                } else {
                  Toast.error(err.message.toString());
                }
              });
          })
          .catch((err) => {
            Toast.error(err.message.toString());
          });
      }
    }
  }, [user, loading, uid, schoolName, match.params.uid]);

  /**
   * The header component containing the user's profile picture and bio in an IonCard
   */
  const Header = React.useCallback(() => {
    return (
      <UserAboutCard busy={busy} noPostsYet={noPostsYet} profilePhoto={profilePhoto}
        userName={userName} spotifyUri={spotifyUri} userMajor={userMajor} userTiktok={userTiktok} userBio={userBio} userInstagram={userInstagram} userSnapchat={userSnapchat} />);
  }, [busy]);

  /**
   * The infinite loading footer compontent
   * 
   * @returns a string that says "Loading..." if there are more posts to load, otherwise an empty string
   */
  const Footer = () => {
    if (!busy && userPosts && userPosts.length > 0) {
      return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', }}>
          {!noMorePosts ? "Loading..." : ""}
        </div>
      )
    }
    return <></>
  }

  return (
    <IonPage >
      <Toolbar user={user} uid={uid} dm={true} schoolName={schoolName} title={""} text={"Back"} />
      <IonContent fullscreen scrollY={false}>
        <Virtuoso
          overscan={1000}
          endReached={fetchMorePosts}
          className="ion-content-scroll-host"
          data={userPosts}
          style={{ height: "100%" }}
          itemContent={(item: number) => {
            let post = userPosts[item];
            let index = item;
            if ("question" in post) {
              return (
                <HomePagePoll profileClickable={false} postIndex={index} post={post} user={user} schoolName={schoolName} />
              )
            }
            return (
              <HomePagePost profileClickable={false} schoolName={schoolName} user={user} index={index} post={post} />
            );
          }}
          components={{ Footer, Header }} />
      </IonContent>
    </IonPage>
  );
};

