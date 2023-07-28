import {
  IonCard, IonCardContent, IonRow, IonAvatar,
  IonLabel, IonSkeletonText, IonFab, IonCol, IonImg, IonNote, IonText, IonIcon, IonChip, IonBadge, IonButton, IonItem, IonList, IonContent, IonPopover
} from "@ionic/react";
import { useToast } from "@agney/ir-toast";
import { logoInstagram, logoSnapchat, logoTiktok, trophyOutline } from "ionicons/icons";
import { PhotoViewer as CapacitorPhotoViewer, Image as CapacitorImage } from '@capacitor-community/photoviewer';
import { useContext } from "../../my-context";
import FadeIn from "react-fade-in/lib/FadeIn";
import Spotify from "react-spotify-embed";
import "swiper/css";
import 'swiper/css/scrollbar';
import { Scrollbar } from 'swiper';
import { Swiper, SwiperSlide } from "swiper/react";
import { AchievementDescriptions, AchievementIcons } from "../../helpers/achievements-config";
import { useEffect } from "react";

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
  const achievements = props.userAchievements;
  console.log(achievements);
  const show = props.showAchievements;

  const Toast = useToast();
  const context = useContext();

  const getDescription = (achievement: string): string => {
    if (achievements.includes(achievement)) {
      return AchievementDescriptions[achievement];
    }
    return "Keep using tellU to unlock this achievement!";
  };

  const getIcon = (achievement: string): string => {
    if (achievements.includes(achievement)) {
      return AchievementIcons[achievement];
    }
    return AchievementIcons['Hidden'];
  };

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

                {show &&
                  <Swiper scrollbar={{ hide: true }} modules={[Scrollbar]}>
                    {achievements.length > 0 &&
                      <SwiperSlide>
                        <IonRow>
                          <IonCol>
                            <IonItem aria-label="Recent Achievements" style={{ '--padding-start': "0px" }}>
                              {achievements.map((achievement: string, index: number) => {
                                if (index <= 3) {
                                  return (
                                    <IonCol key={achievement + index}>
                                      <img aria-hidden="true" style={{ width: "85%" }} src={getIcon(achievement)} id={"click-trigger-" + index.toString()} />
                                      <IonPopover trigger={"click-trigger-" + index.toString()} triggerAction="click">
                                        <IonContent scrollY={false} class="ion-padding">{getDescription(achievement)}</IonContent>
                                      </IonPopover>
                                    </IonCol>
                                  )
                                }
                                return <></>
                              })}
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </SwiperSlide>
                    }
                    {achievements.length > 4 &&
                      <SwiperSlide>
                        <IonRow>
                          <IonCol>
                            <IonItem aria-label="Recent Achievements" style={{ '--padding-start': "0px" }}>
                              {achievements.map((achievement: string, index: number) => {
                                if (index >= 4 && index <= 7) {
                                  return (
                                    <IonCol key={achievement + index}>
                                      <img aria-hidden="true" style={{ width: "85%" }} src={getIcon(achievement)} id={"click-trigger-" + index.toString()} />
                                      <IonPopover trigger={"click-trigger-" + index.toString()} triggerAction="click">
                                        <IonContent scrollY={false} class="ion-padding">{getDescription(achievement)}</IonContent>
                                      </IonPopover>
                                    </IonCol>
                                  )
                                }
                                return <></>
                              })}
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </SwiperSlide>
                    }
                    {achievements.length > 8 &&
                      <SwiperSlide>
                        <IonRow>
                          <IonCol>
                            <IonItem aria-label="Recent Achievements" style={{ '--padding-start': "0px" }}>
                              {achievements.map((achievement: string, index: number) => {
                                if (index >= 8 && index <= 11) {
                                  return (
                                    <IonCol key={achievement + index}>
                                      <img aria-hidden="true" style={{ width: "85%" }} src={getIcon(achievement)} id={"click-trigger-" + index.toString()} />
                                      <IonPopover trigger={"click-trigger-" + index.toString()} triggerAction="click">
                                        <IonContent scrollY={false} class="ion-padding">{getDescription(achievement)}</IonContent>
                                      </IonPopover>
                                    </IonCol>
                                  )
                                }
                                return <></>
                              })}
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </SwiperSlide>
                    }
                    {achievements.length > 12 &&
                      <SwiperSlide>
                        <IonRow>
                          <IonCol>
                            <IonItem aria-label="Recent Achievements" style={{ '--padding-start': "0px" }}>
                              {achievements.map((achievement: string, index: number) => {
                                if (index >= 12 && index <= 15) {
                                  return (
                                    <IonCol key={achievement + index}>
                                      <img aria-hidden="true" style={{ width: "85%" }} src={getIcon(achievement)} id={"click-trigger-" + index.toString()} />
                                      <IonPopover trigger={"click-trigger-" + index.toString()} triggerAction="click">
                                        <IonContent scrollY={false} class="ion-padding">{getDescription(achievement)}</IonContent>
                                      </IonPopover>
                                    </IonCol>
                                  )
                                }
                                return <></>
                              })}
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </SwiperSlide>
                    }
                  </Swiper>
                }


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