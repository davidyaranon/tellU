import { IonContent, IonHeader, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonCardTitle, IonCard, IonSlides, IonSlide, IonItemDivider,
  IonInfiniteScrollContent,  IonModal, IonImg, IonList, IonItem, IonLabel, IonTextarea, IonLoading, IonText, IonAvatar, IonCheckbox,
  IonInput, IonActionSheet, IonButton, IonIcon, IonRippleEffect, IonFab, IonFabButton, IonToolbar, IonTitle, IonButtons, IonRow, IonCol, IonListHeader, IonCardContent } 
from '@ionic/react';
import React, { useRef, useCallback } from 'react';
import { RefresherEventDetail, setupConfig } from '@ionic/core';
import { Geolocation, Geoposition } from '@awesome-cordova-plugins/geolocation';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth, getCurrentUser, logout, addMessage, storage, uploadImage, addComment, getAllPosts, promiseTimeout, upVote } from '../fbconfig'
import Header, { ionHeaderStyle } from './Header'
import '../App.css';
import IconButton from '@mui/material/IconButton';
import { useToast } from "@agney/ir-toast";
import { add, cameraOutline, chatbubblesOutline, locationOutline } from 'ionicons/icons';
import SignalWifiOff from '@mui/icons-material/SignalWifiOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { collection, getDocs,  query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { chevronDownCircleOutline } from 'ionicons/icons';
import { v4 as uuidv4 } from 'uuid';
import { ref, getDownloadURL } from "firebase/storage";
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import '../theme/variables.css';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer';
import defaultMessages from '../components/funnies';
import Avatar from 'react-avatar';
import logo from '../images/pumpkinTest.jpg'
import FadeIn from 'react-fade-in';
  
export interface UserPhoto {
  filepath: string,
  webviewPath?: string;
}

defineCustomElements(window);

function Home() {
  const schoolName = useSelector( (state: any) => state.user.school);
  const hasLoaded = useSelector( (state: any) => state.user.hasLoaded);
  const [busy, setBusy] = useState<boolean>(false);
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  const [photo, setPhoto] = useState<Photo | null>();
  const Toast = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalPicture, setShowModalPicture] = useState<boolean>(false);
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [commentModalPhotoUrl, setCommentModalPhotoUrl] = useState("");
  const [showReloadMessage, setShowReloadMessage] = useState<boolean>(false);
  const [commentModalPostType, setCommentModalPostType] = useState("");
  const [commentModalMessage, setCommentModalMessage] = useState("");
  const [modalImgSrc, setModalImgSrc] = useState("");
  const [photos, setPhotos] = useState<Photo | null>();
  const [blob, setBlob] = useState<any | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [messageSent, setMessageSent] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[] | null>(null);
  const [comments, setComments] = useState<any[] | null>(null);
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  const [generalChecked, setGeneralChecked] = useState<boolean>(true);
  const [locationChecked, setLocationChecked] = useState<boolean>(false);
  const [buySellChecked, setBuySellChecked] = useState<boolean>(false);
  const [alertChecked, setAlertChecked] = useState<boolean>(false);
  const [sightingChecked, setSightingChecked] = useState<boolean>(false);
  const [eventsChecked, setEventsChecked] = useState<boolean>(false);
  const [checkboxSelection, setCheckboxSelection] = useState<string>("general");
  const [locationPinModal, setLocationPinModal] = useState<boolean>(false);
  const [commentModalUserName, setCommentModalUserName] = useState("");
  const [commentModalImgSrc, setCommentModalImgSrc] = useState("");
  const [user] = useAuthState(auth);
  const history = useHistory();
  const min = 0;
  const max = defaultMessages.length - 1;
  const [position, setPosition] = useState<Geoposition | null>();
  const [loadingMessage, setLoadingMessage] = useState("");
  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  }
  const sliderOpts = {
    zoom:true,
    maxRatio : 2
  }

  const handleUpVote = async (postUid : string, postKey : string) => {
    // await upVote(postUid, schoolName, postKey);
  }

  const handleDownVote = () => {
    console.log('downvoted!');
  }

  const handleChange = (e : any) => {
    let currMessage = e.detail.value;
    setMessage(currMessage);
  }

  const handleChangeComment = (e : any) => {
    let currComment = e.detail.value;
    setComment(currComment);
  }

  const handlePostOptions = () => {
    setLocationPinModal(true);
  }

  const handleSendMessage = async () =>{
    setLocationPinModal(false);
    setShowModal(false); 
    messageAdd();
    setGeneralChecked(true);
  }

  const handleSendComment = () => {
    commentAdd();
  }

  const getColor = (postType : string) => {
    switch (postType) {
      case "general":
        return "#61DBFB";
      case "alert":
        return "#ff3e3e";
      case "buy/Sell":
        return "#179b59";
      case "event":
        return "#fc4ad3";
      case "sighting":
        return "#eed202";
      default:
        break;
    }
  }

  const handleCheckboxChange = (checkbox : string) => {
    switch (checkbox) {
      case "general":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        break;
      case "alert":
        setGeneralChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        break;
      case "buySell":
        setAlertChecked(false);
        setGeneralChecked(false);
        setEventsChecked(false);
        setSightingChecked(false);
        break;
      case "event":
        setAlertChecked(false);
        setBuySellChecked(false);
        setGeneralChecked(false);
        setSightingChecked(false);
        break;
      case "sighting":
        setAlertChecked(false);
        setBuySellChecked(false);
        setEventsChecked(false);
        setGeneralChecked(false);
        break;
      default:
        break;
    }
  }

  const locationOptions = {
    enableHighAccuracy : true,
    timeout: 5000,
  }

  const getLocation = async () => {
    setGettingLocation(true);
    try {
        const pos = await Geolocation.getCurrentPosition(locationOptions);
        setPosition(pos);
        console.log(pos.coords);
        setGettingLocation(false);
    } catch (e : any) {
        Toast.error(e.message.toString());
        setGettingLocation(false);
    }
  }

  const handleLoadPosts = () => {
    setBusy(true);
    let tempPosts = promiseTimeout(20000, getAllPosts(schoolName));
    tempPosts.then((allPosts : any[]) => {
      if(allPosts && allPosts != []) {
        setPosts(allPosts);
        console.log(allPosts);
      } else {
        Toast.error("Unable to load posts");
      }
      timeout(2500).then(() => {
        setBusy(false);
      });
    });
    tempPosts.catch((err : any) => {
      Toast.error(err);
      setBusy(false);
      setPosts(null);
      setShowReloadMessage(true);
    });
  }
  
  async function doRefresh(event: CustomEvent<RefresherEventDetail> ) {
    loadLoadingMessage();
    handleLoadPosts();
    setTimeout(() => {
      event.detail.complete();
    }, 1000);
  }

  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
  }

  function showPicture(src : string) {
    // setModalImgSrc(src);
    // setShowModalPicture(true);
    PhotoViewer.show(src);
  }

  async function sendImage(blob: any, uniqueId : string) {
    const res = await uploadImage("images", blob, uniqueId);
    if(res == false || photo == null || photo?.webPath == null) {
      Toast.error("unable to select photo");
    } else {
      Toast.success("photo uploaded successfully");
    }
  }

  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Uri,
      });
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if(blobRes) {
        if(blobRes.size > 5_000_000) { // 5MB
          Toast.error("Image too large")
        } else {
          setBlob(blobRes);
          setPhoto(image);
          setLoading(true);
          await timeout(1000);
          setLoading(false);
        }
      }
    } catch(err : any) {
      // Toast.error(err.message.toString());
    }
  }

  const handleCommentModal = async (post : any, e : any) => {
    let elementName = e.target.tagName.toLowerCase();
    if (elementName == 'h2' || elementName == 'ion-button' || elementName == 'p') {
      console.log('opening comment modal....');
      console.log(post);
      setShowModalComment(true);
      try {
        setBusy(true);
        if(user && db) {
          let tempCommentsArr : any[] = [];
          for(let i = 0; i < post.comments.length; ++i) {
            let res = "";
            let url = post.comments[i].url;
            if(url.length > 0) {
              res = await getDownloadURL(ref(storage, url));
            }
            tempCommentsArr.push({
              ...post.comments[i],
              imgSrc: res,
            });
          }
          setCommentModalPhotoUrl(post.photoURL);
          if(post.postType) {
            setCommentModalPostType(post.postType.replace('/', ''));
          } else {
            setCommentModalPostType("general");
          }
          setCommentModalMessage(post.message);
          setCommentModalUserName(post.userName);
          setComments(tempCommentsArr);
          setCommentModalImgSrc(post.imgSrc);
        }
        setBusy(false);
      } catch(err : any){
        console.log(err);
        Toast.error(err.message.toString());
        setBusy(false);
      }
    }
  }

  async function commentAdd() {
    if(message.trim().length == 0){
      Toast.error("Input a comment");
    } else {
      setBusy(true);
      const res = addComment(comment.trim());
    }
  }

  async function messageAdd() {

    if(message.trim().length == 0 && !blob) {
      Toast.error("Input a message!");
    } else if(!eventsChecked && !buySellChecked && !alertChecked && !sightingChecked && !generalChecked){
      Toast.error("Select a post type");
    } else {
      setBusy(true);
      let uniqueId = uuidv4();
      if(blob) {
        await sendImage(blob, uniqueId.toString());
        setBlob(null);
        setPhoto(null);
      }
      const res = await addMessage(message, blob, uniqueId.toString(), position, schoolName, checkboxSelection);
      if(res == 'false') {
        Toast.error("Unable to process message :(");
      } else {
        Toast.success("Uploaded!");
        setMessageSent(true);
        setMessage("");
        handleLoadPosts();
      }
      setBusy(false);
    }
  }

  const loadLoadingMessage = () => {
    let rand = Math.floor( min + Math.random() * (max - min) );
    setLoadingMessage(defaultMessages[rand]);
  }

  useEffect(() => {
    loadLoadingMessage();
    setBusy(true);
    if(!user) {
      setBusy(false);
        history.replace("/landing-page");
    } else if(schoolName){
      console.log(user);
      handleLoadPosts();
    }
  }, [schoolName]);

  if(posts) {
    return (
      <React.Fragment>
        <IonContent >
        
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
        <br></br><br></br><br></br>
          <IonRefresherContent
            pullingText="Pull to refresh"
            refreshingSpinner="crescent"
            refreshingText="Refreshing...">
          </IonRefresherContent>
          </IonRefresher>

          <IonLoading spinner='dots' message={loadingMessage} duration={0} isOpen={busy}></IonLoading>

          <IonLoading spinner='dots' message="Getting Location..." duration={0} isOpen={gettingLocation}></IonLoading>

          <FadeIn transitionDuration={1500}>
            <IonHeader class="ion-no-border" style={ionHeaderStyle}>
              <Header schoolName={schoolName}/>
            </IonHeader> 
          </FadeIn>
          <IonModal showBackdrop={true} isOpen={locationPinModal} onDidDismiss={() => {setLocationPinModal(false); handleCheckboxChange("general"); }} breakpoints={[0,0.9]} initialBreakpoint={0.9} backdropBreakpoint={0.2} >
              <IonContent> 
                  <IonHeader translucent>
                      <IonToolbar mode='ios'>
                          <IonTitle>Post</IonTitle>
                          <IonButtons slot='end'>
                              <IonButton mode='ios' onClick={() => {setLocationPinModal(false)}}>Close</IonButton>
                          </IonButtons>
                      </IonToolbar>
                  </IonHeader>
                  <br></br>
                <IonList inset={true} mode='ios'>
                <IonListHeader mode='ios'>Select One</IonListHeader>
                <IonItem lines='none' mode='ios' >
                  <IonLabel>General</IonLabel>
                  <IonCheckbox id='generalCheckbox' checked={generalChecked} slot='start' onIonChange={(e) => {handleCheckboxChange("general"); setGeneralChecked(e.detail.checked); if(e.detail.checked) setCheckboxSelection("general"); }}></IonCheckbox>
                </IonItem>
                <IonItem lines='none' mode='ios'>
                  <IonLabel>Alert</IonLabel>
                  <IonCheckbox id='alertCheckbox' checked={alertChecked} slot='start' onIonChange={(e) => {handleCheckboxChange("alert"); setAlertChecked(e.detail.checked); if(e.detail.checked) setCheckboxSelection("alert");}}></IonCheckbox>
                </IonItem>
                <IonItem lines='none' mode='ios'>
                  <IonLabel>Buy/Sell</IonLabel>
                  <IonCheckbox id='buySellCheckbox' checked={buySellChecked} slot='start' onIonChange={(e) => { handleCheckboxChange("buySell"); setBuySellChecked(e.detail.checked); if(e.detail.checked) setCheckboxSelection("buy/Sell");}}></IonCheckbox>
                </IonItem>
                <IonItem lines='none' mode='ios'>
                  <IonLabel>Sighting</IonLabel>
                  <IonCheckbox id='sightingCheckbox' checked={sightingChecked} slot='start' onIonChange={(e) => {handleCheckboxChange("sighting"); setSightingChecked(e.detail.checked); if(e.detail.checked) setCheckboxSelection("sighting");}}></IonCheckbox>
                </IonItem>
                <IonItem lines='none' mode='ios'>
                  <IonLabel>Event</IonLabel>
                  <IonCheckbox id='eventCheckbox' checked={eventsChecked} slot='start' onIonChange={(e) => {handleCheckboxChange("event"); setEventsChecked(e.detail.checked); if(e.detail.checked) setCheckboxSelection("event");}}></IonCheckbox>
                </IonItem>
              </IonList>
              <IonList inset={true} mode='ios'>
                <IonItem mode='ios' lines='none'>
                  <IonLabel> Add pin to map?* </IonLabel>
                  <IonCheckbox slot='start' checked={locationChecked} onIonChange={e => { setLocationChecked(e.detail.checked); if(e.detail.checked) getLocation(); else setPosition(null); }} />
                </IonItem>
              </IonList>
              <div className='ion-button-container'>
                <p> *Adding a pin uses your current location</p>
                <IonButton onClick={() => { handleSendMessage(); }} expand='full' color="transparent" mode='ios' shape="round" fill="outline" id="message" >Send</IonButton>
              </div>
              </IonContent>
            </IonModal>

                         
          <IonModal backdropDismiss={false} isOpen={showModal} >
            <div className='ion-modal'>
              <IonTextarea color='secondary' maxlength={200} style={ionInputStyle} value={message} placeholder="Start typing..." id="message" onIonChange={(e: any) => { handleChange(e); }} ></IonTextarea>
              <IconButton onClick={takePicture} >
                <IonFabButton mode='ios' color='medium'>
                  <IonIcon icon={cameraOutline} />
                </IonFabButton>
              </IconButton>
              <IonFab style={{top: "15.7vh"}} horizontal="end">
                <IonButton onClick={() => { setPhoto(null); setBlob(null); setShowModal(false); }}  color="danger" mode='ios' shape="round" fill="outline" id="close" > Close </IonButton>
                <IonButton onClick={() => { handlePostOptions(); }} color="transparent" mode='ios' shape="round" fill="outline" id="message" >Send</IonButton>
              </IonFab>
                <br></br><br></br><br></br>
              <IonCard>
                <IonImg src={photo?.webPath} />
              </IonCard>
            </div>
          </IonModal>

          <IonFab vertical="bottom" horizontal="end" slot="fixed" >
            <IonFabButton onClick={() => {setShowModal(true); }}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          <IonModal backdropDismiss={false} isOpen={showModalPicture }>
              <IonCard >
                <IonHeader translucent>
                  <IonToolbar mode='ios'>
                      <IonButtons slot='end'>
                          <IonButton mode='ios' onClick={() => {setShowModalPicture(false)}}>Close</IonButton>
                      </IonButtons>
                  </IonToolbar>
                </IonHeader>
                <IonSlides options={sliderOpts}>
                  <IonSlide>
                    <div className='swiper zoom container'>
                    <IonImg src={modalImgSrc} />
                    </div>
                  </IonSlide>
                </IonSlides>
              </IonCard>
          </IonModal>

          <IonModal backdropDismiss={false} isOpen={showModalComment}>
            <IonContent>
            <div className='ion-modal'>
              <IonFab horizontal="end">
                <IonButton onClick={() => { setShowModalComment(false); setComment(""); }}  color="danger" mode='ios' shape="round" fill="outline" id="close" >X</IonButton>
              </IonFab>
              <br></br><br></br><br></br>
              {commentModalUserName ? (
                <div>
                <IonList inset={true}>
                  <IonItem lines='none' >
                    <IonLabel class='ion-text-wrap'>
                      <IonText color='medium'>
                      <p>
                        <IonAvatar class='posts-avatar'> 
                            <IonImg src={commentModalPhotoUrl}></IonImg>
                        </IonAvatar> 
                        {commentModalUserName}
                      </p>
                      </IonText>
                      {/* {commentModalPostType != "general"  ? (
                      <IonFab vertical='top' horizontal='end'>
                        <p style={{fontWeight:"bold", color:getColor(commentModalPostType)}}>{commentModalPostType.toUpperCase()}</p>
                      </IonFab>
                      ) : (null) } */}
                      <wbr></wbr>
                      <h2 className='h2-message'>{commentModalMessage}</h2>
                    </IonLabel>
                    <div id={commentModalPostType}></div>
                  </IonItem>
                </IonList>
                <div className='verticalLine'></div>
                {commentModalImgSrc && commentModalImgSrc.length > 0 ? (
                <IonCard style={{bottom: "7.5vh"}}>
                  <IonCardContent>
                    <IonImg onClick={() => {PhotoViewer.show(commentModalImgSrc)}} src={commentModalImgSrc}></IonImg>
                  </IonCardContent>
                </IonCard>
              ) : (null)}   
                </div>
              ) : null}
              <p style={{textAlign: "center"}}>Comments</p>
              <br></br>
              {comments && comments.length > 0? (
                comments?.map((comment, index) => 
                  <IonList inset={true} key={index}>
                     <IonItem lines='none' >
                        <IonLabel class="ion-text-wrap">
                          <IonText color='medium'>
                          <p> 
                            <IonAvatar class='posts-avatar'> 
                              <IonImg src={comment?.photoURL!}></IonImg>
                            </IonAvatar> 
                            {comment.userName} 
                          </p>
                          </IonText>
                          <wbr></wbr>
                          <h2 className='h2-message'> {comment.comment} </h2>
                          {comment.url.length > 0 ? (
                          <div className="ion-img-container">
                            <br></br>
                            <IonImg  onClick={() => {showPicture(comment.imgSrc)}} src={comment.imgSrc}/>
                          </div>
                          ) : null}
                        </IonLabel>
                        <div></div>
                      </IonItem>
                      <IonItem lines='none' mode='ios'>
                        <IonButton mode='ios' fill='outline' color='medium'>
                          <KeyboardArrowUpIcon />
                          <p>{comment.upVotes} </p>
                        </IonButton>
                        <IonButton mode='ios' fill='outline' color='medium' onClick={handleDownVote}>
                          <KeyboardArrowDownIcon />
                          <p>{comment.downVotes} </p>
                        </IonButton>
                      </IonItem>
                  </IonList>
                )
              ) : null}
              <IonTextarea color='secondary' spellcheck={true} maxlength={200} style={ionInputStyle} value={comment} placeholder="Leave a comment..." id="message" onIonChange={(e: any) => { handleChangeComment(e); }} ></IonTextarea>
              <div className='ion-button-container'>
                <IonButton color="transparent" mode='ios' shape="round" fill="outline" expand="block"  id="signUpButton" >Comment</IonButton>
              </div>
              <wbr></wbr><br></br>
            </div>
            </IonContent>
          </IonModal>
          
          {posts!.length > 0 ? (
            posts?.map((post) => 
            <IonList inset={true} mode='ios' key={post.key}>
              <IonItem lines='none' mode='ios' >
                <IonLabel class="ion-text-wrap">
                  <IonText color='medium'>
                    <IonRow>
                      <IonCol size='6'>
                        <p> 
                          <IonAvatar class='posts-avatar'> 
                            <IonImg src={post?.photoURL!}>
                            </IonImg>
                          </IonAvatar> 
                          {post.userName} 
                        </p>
                      </IonCol>
                      <IonCol >
                        {post.postType && post.postType != "general" ? 
                        (
                          <IonFab horizontal='end'>
                            <p style={{fontWeight:"bold", color:getColor(post.postType)}}>{post.postType.toUpperCase()}</p>
                          </IonFab>
                        ) 
                        : (null) }
                      </IonCol>
                    </IonRow>
                  </IonText> 
                  <wbr></wbr>         
                  <h3 className='h2-message' style={{marginLeft: "2.5%"}}> {post.message} </h3>
                  {post.url.length > 0 ? (
                  <div className="ion-img-container">
                    <br></br>
                    <IonImg className='ion-img-style' onClick={() => {showPicture(post.imgSrc)}} src={post.imgSrc}/>
                  </div>
                  ) : null}
                </IonLabel>
              </IonItem>
              <IonItem lines='none' mode='ios'>
              <IonButton mode='ios' fill='outline' color='medium' onClick={() => {handleUpVote(post.uid, post.key)}}>
                  <KeyboardArrowUpIcon />
                  <p>{post.upVotes} </p>
                </IonButton>
                <p>&nbsp;</p>
                <IonButton mode='ios' color='medium' onClick={(e) => {handleCommentModal(post, e)}}>
                  <IonIcon icon={chatbubblesOutline}/>
                  <p>&nbsp; {post.comments.length} </p>
                </IonButton>
                <IonButton mode='ios' fill='outline' color='medium' onClick={handleDownVote}>
                  <KeyboardArrowDownIcon />
                  <p>{post.downVotes} </p>
                </IonButton>
              </IonItem>
            </IonList>
            )
          ) : <div>
                <h3 className='h3-error'> Unable to load posts, swipe down from top to reload page </h3>
                <div className='h3-error'>
                  <SignalWifiOff fontSize="large" style={{fontSize: '4.10vh'}}/>
                </div>
              </div>}

        </IonContent>
      </React.Fragment>
    );
  }
  else if(showReloadMessage) {
    return (
      <React.Fragment>
      <IonContent >
      <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
        <IonRefresherContent
          pullingIcon={chevronDownCircleOutline}
          pullingText="Pull to refresh"
          refreshingSpinner="crescent"
          refreshingText="Refreshing...">
        </IonRefresherContent>
      </IonRefresher>

      <IonLoading spinner='dots' message="Please wait..." duration={0} isOpen={busy}></IonLoading>

      <IonHeader class="ion-no-border" style={ionHeaderStyle}>
        <Header />
      </IonHeader> 

      <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
        <IonRefresherContent
          pullingIcon={chevronDownCircleOutline}
          pullingText="Pull to refresh"
          refreshingSpinner="crescent"
          refreshingText="Refreshing...">
        </IonRefresherContent>
      </IonRefresher>
      <div>
        <h3 className='h3-error'> Unable to load posts, swipe down from top to reload page </h3>
        <div className='h3-error'>
          <SignalWifiOff fontSize="large" style={{fontSize: '4.10vh'}}/>
        </div>
      </div>
      </IonContent>
      </React.Fragment>
    );
  }
  else {
    return( <IonLoading spinner='dots' duration={0} isOpen={busy}></IonLoading> 
    );
  }
}

export default React.memo(Home);
