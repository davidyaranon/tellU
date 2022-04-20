import { IonContent, IonHeader, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonCardTitle, IonCard, IonSlides, IonSlide,
  IonInfiniteScrollContent,  IonModal, IonImg, IonList, IonItem, IonLabel, IonTextarea, IonLoading, IonText, IonAvatar, IonNote,
  IonInput, IonActionSheet, IonButton, IonIcon, IonRippleEffect, IonFab, IonFabButton, IonToolbar, IonTitle, IonButtons, IonSearchbar, IonBreadcrumbs, IonBreadcrumb, IonicSwiper, IonCardContent, IonRow, IonCol } 
from '@ionic/react';
import React, { useEffect, useState } from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { chatbubblesOutline, chevronBack, chevronForward } from 'ionicons/icons';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, getTopPostsWithinPastDay } from '../fbconfig'
import Header, { ionHeaderStyle } from './Header'
import '../App.css';
import { useHistory } from 'react-router';
import { getUsers, getNextBatchUsers } from '../fbconfig';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ToastProvider, useToast } from '@agney/ir-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards } from 'swiper';
import { useSelector } from 'react-redux';
import 'swiper/css';
import FadeIn from 'react-fade-in';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer';
// import 'swiper/css/effect-cards';

function Community() {
  const schoolName = useSelector( (state: any) => state.user.school);
  const Toast = useToast();
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [user, loading, error] = useAuthState(auth);
  const [busy, setBusy] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [lastKey, setLastKey] = useState<string>("");
  const [userList, setUserList] = useState<any[]>([]);
  const history = useHistory();
  const topPostsCache = localStorage.getItem("topPosts") || "false";
  const fetchMoreUserData = (key : string) => {
    if(key && key.length > 0) {
      setBusy(true);
      getNextBatchUsers(key).then((res) => {
        setLastKey(res!.lastKey);
        setUserList(userList?.concat(res?.userList));
        setBusy(false);
      }).catch((err : any) => {
        Toast.error(err.message.toString());
        setBusy(false);
      })
    }
  }
  useEffect(() => {
    setBusy(true);
    if(!user) {
      history.replace("/landing-page");
    } else{
      if(schoolName) {
        if(topPostsCache != "false") {
          setTopPosts(JSON.parse(topPostsCache));
        } 
        getTopPostsWithinPastDay(schoolName).then((res : any) => {
          setTopPosts(res);
          localStorage.setItem("topPosts", JSON.stringify(res));
          console.log(res);
        });
      }
      setBusy(false);
    }
  }, [user, schoolName]);
  return (
    <React.Fragment>
      <IonContent>
        <IonHeader class="ion-no-border" style={ionHeaderStyle}>
          <IonToolbar style={{marginTop: "5%"}} mode='ios'>
            <IonSearchbar mode='ios' placeholder='Search for posts/users' inputMode='search' value={searchText} onIonChange={e => setSearchText(e.detail.value!)}></IonSearchbar>
          </IonToolbar>
        </IonHeader>
        <IonLoading message="Please wait..." duration={0} isOpen={busy}></IonLoading>

        <IonHeader>
          <IonTitle>Top Posts</IonTitle>
          <FadeIn>
          <IonFab horizontal='end' >
              <IonIcon icon={chevronForward} />
          </IonFab>
          <IonFab horizontal='start' >
              <IonIcon icon={chevronBack} />
          </IonFab>
          </FadeIn>

        </IonHeader>
        
        <Swiper slidesPerView={1.5}>
          {topPosts && topPosts.length > 0 ? (
            
            topPosts.map((post) => {
              return (
              <SwiperSlide key={post.key}>
                <IonCard className='ion-card-community' mode='ios'>
                <IonCardContent>
										<IonCardTitle style={{fontSize: "medium"}} mode='ios'>{ post.data.userName }</IonCardTitle>
                    <br></br>
										<IonNote color='medium' className="subtitle">{ post.data.message }</IonNote>
                    {post.imgSrc && post.imgSrc.length > 0? (
                      <div>
                        <br></br>
                      <IonImg className='ion-img-style' onClick={() => {PhotoViewer.show(post.imgSrc)}} src={post.imgSrc} />
                      <br></br><br></br><br></br>
                      </div>
                    ) : (null)}
                    
									</IonCardContent>
                  <IonFab vertical='bottom'>
                    <IonRow>
                      <IonCol size='4'>
                        <IonButton style={{width:"16vw"}} mode='ios' fill='outline' color='medium' >
                          <KeyboardArrowUpIcon />
                          <p>{post.data.upVotes} </p> 
                        </IonButton>
                      </IonCol>
                      <IonCol size='4'>
                        <IonButton style={{width:"16vw"}}  mode='ios' color='medium' >
                          <IonIcon icon={chatbubblesOutline}/>
                          <p>&nbsp; {post.data.comments.length} </p>
                        </IonButton>
                      </IonCol >
                      <IonCol size='4'>
                        <IonButton style={{width:"16vw"}} mode='ios' fill='outline' color='medium' >
                          <KeyboardArrowDownIcon />
                          <p>{post.data.downVotes} </p>
                        </IonButton>
                      </IonCol>
                    </IonRow>
                    </IonFab>
                    
                </IonCard>
              </SwiperSlide>
              )
            })
          ) : (null)}
        </Swiper>

      </IonContent>
    </React.Fragment>
  );
}

export default React.memo(Community);
