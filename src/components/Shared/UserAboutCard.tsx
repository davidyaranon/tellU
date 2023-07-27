import {
  IonCard, IonCardContent, IonRow, IonAvatar,
  IonLabel, IonSkeletonText, IonFab, IonCol, IonImg, IonNote, IonText, IonIcon, IonChip, IonBadge, IonButton, IonItem, IonList
} from "@ionic/react";
import { useToast } from "@agney/ir-toast";
import { logoInstagram, logoSnapchat, logoTiktok, trophyOutline } from "ionicons/icons";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import { useContext } from "../../my-context";
import FadeIn from "react-fade-in/lib/FadeIn";
import Spotify from "react-spotify-embed";
import { Swiper, SwiperSlide } from "swiper/react";

import empty_achievement from '../../images/empty_achievement.png';
import tellU_sovereign from '../../images/tellU_sovereign.png';
interface iAchievement {
  icon: string;
  description: string;
  title: string;
}

const achievements: iAchievement[] = [
  { title: "1one", icon: logoInstagram, description: "User likes a post" },
  { title: "1one", icon: logoInstagram, description: "User likes a post" },
  { title: "1one", icon: logoInstagram, description: "User likes a post" },
  { title: "1one", icon: logoInstagram, description: "User likes a post" },
  { title: "1one", icon: logoInstagram, description: "User likes a post" },
  { title: "1one", icon: logoInstagram, description: "User likes a post" },
  { title: "1one", icon: logoInstagram, description: "User likes a post" },
  { title: "1one", icon: logoInstagram, description: "User likes a post" },

]

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

  const Toast = useToast();
  const context = useContext();

  return (
    <FadeIn>
      <IonCard mode="ios">
        <IonCardContent>
          {busy ? (
            <>
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
            </>
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
                        <IonChip outline color="snapchat-yellow">
                          <IonText style={{ fontSize: "0.75em" }}>
                            <IonIcon style={{}} icon={logoSnapchat} />
                            {'\u00A0'}
                            {userSnapchat}
                          </IonText>
                        </IonChip>
                      </IonCol>
                    </>
                  ) : null}
                  {userInstagram && userInstagram.length > 0 ? (
                    <>
                      <IonCol>
                        <IonChip outline color="instagram-hex">
                          <IonText onClick={() => { window.open("https://instagram.com/" + userInstagram.replace('@', '')); }} style={{ fontSize: "0.75em" }}>
                            <IonIcon style={{}} icon={logoInstagram} />
                            {'\u00A0'}
                            {userInstagram}
                          </IonText>
                        </IonChip>
                      </IonCol>
                    </>
                  ) : null}
                  {userTiktok && userTiktok.length > 0 ? (
                    <>
                      <IonCol>
                        <IonChip outline color="tik-tok-hex">
                          <IonText onClick={() => { window.open('https://www.tiktok.com/@' + userTiktok.replace('@', '') + '?lang=en'); }} style={{ fontSize: "0.75em" }}>
                            <IonIcon style={{}} icon={logoTiktok} />
                            {'\u00A0'}
                            {userTiktok}
                          </IonText>
                        </IonChip>
                      </IonCol>
                    </>
                  ) : null}
                </IonRow>

                <Swiper>
                  <SwiperSlide>
                    <IonRow>
                      <IonCol>
                        <IonItem button disabled aria-label="Recent Achievements" style={{ '--padding-start': "0px", textAlign: 'center', opacity: '99%' }} onClick={() => { }}>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={empty_achievement} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={empty_achievement} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }}src={empty_achievement} />
                          </IonCol>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </SwiperSlide>
                  <SwiperSlide>
                    <IonRow>
                      <IonCol>
                        <IonItem button disabled aria-label="Recent Achievements" style={{ '--padding-start': "0px", textAlign: 'center', opacity: '99%' }} onClick={() => { }}>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </SwiperSlide>
                  <SwiperSlide>
                    <IonRow>
                      <IonCol>
                        <IonItem aria-label="Recent Achievements" style={{ '--padding-start': "0px", textAlign: 'center' }} onClick={() => { }}>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                          <IonCol>
                            <IonImg aria-hidden="true" style={{ height: "75%" }} src={tellU_sovereign} />
                          </IonCol>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </SwiperSlide>
                </Swiper>



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
                      <>
                        <Spotify allow="encrypted-media" style={{ width: "82.5vw", backgroundColor: "#2f2f2f", borderRadius: "15px", maxHeight: "80px", opacity: 100, colorScheme: "normal" }} wide link={"https://open.spotify.com/track/" + spotifyUri.substring(14)} />
                      </>
                      :
                      <>
                        <Spotify allow="encrypted-media" style={{ width: "82.5vw", backgroundColor: "#2f2f2f", borderRadius: "15px", maxHeight: "80px", opacity: 100, colorScheme: "normal" }} wide link={"https://open.spotify.com/track/" + spotifyUri.substring(14)} />
                      </>
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