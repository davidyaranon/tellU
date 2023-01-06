import {
  IonCard, IonCardContent, IonRow, IonAvatar,
  IonLabel, IonSkeletonText, IonFab, IonCol, IonImg, IonNote, IonText, IonIcon
} from "@ionic/react";
import { useState } from "react";
import { useToast } from "@agney/ir-toast";
import { logoInstagram, logoSnapchat, logoTiktok } from "ionicons/icons";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import { useContext } from "../../my-context";
import FadeIn from "react-fade-in/lib/FadeIn";

export const UserAboutCard = (props: any) => {

  const busy = props.busy;
  const profilePhoto = props.profilePhoto;
  const noPostsYet = props.noPostsYet;
  const username = props.userName;
  const userBio = props.userBio;
  const userInstagram = props.userInstagram;
  const userSnapchat = props.userSnapchat;
  const userTiktok = props.userTiktok;
  const userMajor = props.userMajor;
  const spotifyUri = props.spotifyUri;

  const [iFrameLoader, setIframeLoader] = useState<boolean>(false);

  const Toast = useToast();
  const context = useContext();

  return (
    <FadeIn>
      <IonCard mode="ios">
        <IonCardContent>
          {busy ? (
            <FadeIn>
              <IonRow>
                <IonAvatar className="user-avatar">
                  <IonLabel>
                    <IonSkeletonText animated={true} />
                  </IonLabel>
                </IonAvatar>
                <IonLabel>
                  <IonSkeletonText
                    animated={true}
                    style={{ width: "50vw", height: "1.75em", marginLeft: "5vw", bottom: "-1.9vh" }}
                  />
                  <IonSkeletonText
                    animated={true}
                    style={{ width: "50vw", marginLeft: "5vw", bottom: "-1.9vh" }}
                  />
                </IonLabel>
                {/* </IonFab> */}
              </IonRow>
              <div style={{ height: "5vh" }}></div>
              <IonFab vertical="bottom" horizontal="start">
                <IonSkeletonText style={{ width: "75vw", marginLeft: "5vw" }} animated />
                <IonSkeletonText style={{ width: "75vw", marginLeft: "5vw" }} animated />
                <IonSkeletonText style={{ width: "75vw", marginLeft: "5vw" }} animated />
              </IonFab>
            </FadeIn>
          ) : (
            <>
              <FadeIn>
                <IonRow class="ion-justify-content-start">
                  <IonCol size="4">
                    <IonAvatar className="user-avatar">
                      <IonImg onClick={() => {
                        const img: CapacitorImage = {
                          url: profilePhoto,
                          title: username
                        };
                        CapacitorPhotoViewer.show({
                          options: {
                            title: true
                          },
                          images: [img],
                          mode: 'one',
                        }).catch((err) => {
                          const toast = Toast.create({ message: 'Unable to open image', duration: 2000, color: 'toast-error' });
                          toast.present();
                        });
                        // PhotoViewer.show(profilePhoto, username);
                      }}
                        src={profilePhoto} />
                    </IonAvatar>
                  </IonCol>
                  {userMajor && userMajor.length > 0 ? (
                    <IonCol class="ion-padding-top" size="8">
                      <p style={{ fontSize: "1.5em" }}>{username}</p>
                      <IonNote style={{ fontSize: "1em" }}>
                        {userMajor}
                      </IonNote>
                    </IonCol>
                  ) : <IonCol class="ion-padding-top" size="8">
                    <p className="ion-padding-top" style={{ fontSize: "1.5em" }}> {username}</p>
                  </IonCol>}
                </IonRow>
                <IonRow>
                  {userSnapchat && userSnapchat.length > 0 ? (
                    <>
                      <IonCol>
                        <IonText style={{ fontSize: "0.75em" }}>
                          <IonIcon style={{}} icon={logoSnapchat} />
                          {'\u00A0'}
                          {userSnapchat}
                        </IonText>
                      </IonCol>
                    </>
                  ) : null}
                  {userInstagram && userInstagram.length > 0 ? (
                    <>
                      <IonCol>
                        <IonText onClick={() => { window.open("https://instagram.com/" + userInstagram); }} style={{ fontSize: "0.75em" }}>
                          <IonIcon style={{}} icon={logoInstagram} />
                          {'\u00A0'}
                          {userInstagram}
                        </IonText>
                      </IonCol>
                    </>
                  ) : null}
                  {userTiktok && userTiktok.length > 0 ? (
                    <>
                      <IonCol>
                        <IonText onClick={() => { window.open('https://www.tiktok.com/@' + userTiktok + '?lang=en'); }} style={{ fontSize: "0.75em" }}>
                          <IonIcon style={{}} icon={logoTiktok} />
                          {'\u00A0'}
                          {userTiktok}
                        </IonText>
                      </IonCol>
                    </>
                  ) : null}
                </IonRow>
                {userTiktok && userSnapchat && userInstagram && (userTiktok.length > 0 || userSnapchat.length > 0 || userInstagram.length > 0) ? (
                  <>
                    <br />
                  </>
                ) : null}
                {userBio && userBio.length > 0 ? (
                  <>
                    <IonRow class="ion-justify-content-start">
                      <p style={{ fontSize: "1em", marginLeft: "2%" }}>{userBio}</p>
                    </IonRow>
                  </>
                ) : null}
                {spotifyUri &&
                  <FadeIn delay={250} transitionDuration={750}>
                    <br />
                    {context.darkMode ?
                      <iframe
                        id="iframe1"
                        title="darkmode_iframe_spotify"
                        style={iFrameLoader ? { width: "82.5vw", backgroundColor: "#2f2f2f", borderRadius: "15px", maxHeight: "80px", opacity: 0, colorScheme: "normal" } : { width: "82.5vw", backgroundColor: "#2f2f2f", borderRadius: "15px", maxHeight: "80px", opacity: 100, colorScheme: "normal" }}
                        className='Music'
                        onLoad={() => { setIframeLoader(false); }}
                        src={"https://embed.spotify.com/?uri=" + spotifyUri} frameBorder="0" allow="autoplay; clipboard-write; fullscreen; picture-in-picture "
                        seamless={true}
                        loading="eager"
                      >
                      </iframe>
                      :
                      <iframe
                        id="iframetwo"
                        title="lightmode_iframe_spotify"
                        style={iFrameLoader ? { width: "82.5vw", backgroundColor: "#f2f1f1", borderRadius: "15px", maxHeight: "80px", opacity: 0, colorScheme: "normal" } : { backgroundColor: "#f2f1f1", width: "82.5vw", borderRadius: "15px", maxHeight: "80px", opacity: 100, colorScheme: "normal" }}
                        className='Music'
                        onLoad={() => { setIframeLoader(false); }}
                        src={"https://embed.spotify.com/?uri=" + spotifyUri} frameBorder="0" allow="autoplay; clipboard-write; fullscreen; picture-in-picture "
                        seamless={true}
                        loading="eager"
                      >
                      </iframe>
                    }

                  </FadeIn>
                }
              </FadeIn>
            </>
          )}
        </IonCardContent>
      </IonCard>
      {!noPostsYet &&
        <div style={{ textAlign: "center", alignItems: "center" }}>
          <IonLabel>Posts</IonLabel>
        </div>
      }
    </FadeIn>
  );
}