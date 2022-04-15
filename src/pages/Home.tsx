import { IonContent, IonHeader, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonCardTitle, IonCard, IonSlides, IonSlide,
  IonInfiniteScrollContent,  IonModal, IonImg, IonList, IonItem, IonLabel, IonTextarea, IonLoading, IonText, 
  IonInput, IonActionSheet, IonButton, IonIcon, IonRippleEffect, IonFab, IonFabButton, IonToolbar, IonTitle, IonButtons } 
from '@ionic/react';
import React, { useRef, useCallback } from 'react';
import { RefresherEventDetail } from '@ionic/core';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth, getCurrentUser, logout, addMessage, storage, uploadImage, addComment, getAllPosts, promiseTimeout } from '../fbconfig'
import Header, { ionHeaderStyle } from './Header'
import '../App.css';
import { useToast } from "@agney/ir-toast";
import { add, cameraOutline, chatbubblesOutline } from 'ionicons/icons';
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

export interface UserPhoto {
  filepath: string,
  webviewPath?: string;
}

defineCustomElements(window);

function Home() {
  const hasLoaded = useSelector( (state: any) => state.user.hasLoaded);
  const [busy, setBusy] = useState<boolean>(false);
  const [photo, setPhoto] = useState<Photo | null>();
  const Toast = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalPicture, setShowModalPicture] = useState<boolean>(false);
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
  const [showReloadMessage, setShowReloadMessage] = useState<boolean>(false);
  const [commentModalPost, setCommentModalPost] = useState("");
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
  const [commentModalUserName, setCommentModalUserName] = useState("");
  const [user] = useAuthState(auth);
  const history = useHistory();
  const min = 0;
  const max = defaultMessages.length - 1;
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

  const handleUpVote = () => {
    console.log('upvoted!');
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

  const handleSendMessage = () => {
    setShowModal(false); 
    messageAdd();
  }

  const handleSendComment = () => {
    commentAdd();
  }

  const handleLoadPosts = () => {
    setBusy(true);
    let tempPosts = promiseTimeout(20000, getAllPosts());
    tempPosts.then((allPosts : any[]) => {
      if(allPosts && allPosts != []) {
        setPosts(allPosts);
      } else {
        Toast.error("Unable to load posts");
      }
      setBusy(false);
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
    const res = await uploadImage(blob, uniqueId);
    if(!res || photo == null || photo?.webPath == null) {
      Toast.error("unable to select photo");
    } else {
      Toast.success("photo uplaoded successfully");
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
          setCommentModalMessage(post.message);
          setCommentModalUserName(post.userName);
          setComments(tempCommentsArr);
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
    } else {
      setBusy(true);
      let uniqueId = uuidv4();
      if(blob) {
        await sendImage(blob, uniqueId.toString());
        setBlob(null);
        setPhoto(null);
      }
      const res = await addMessage(message.trim(), blob, uniqueId.toString());
      if(res == 'false') {
        Toast.error("Unable to process message :(");
      } else {
        Toast.success("Uploaded!");
        setMessageSent(true);
        handleLoadPosts();
      }
      setShowModal(false);
      setBusy(false);
    }
    setMessage("");
  }

  const loadLoadingMessage = () => {
    let rand = Math.floor( min + Math.random() * (max - min) );
    setLoadingMessage(defaultMessages[rand]);
  }

  useEffect(() => {
    loadLoadingMessage();
    setBusy(true);
    if(!user) {
        history.replace("/landing-page");
    } else{
      handleLoadPosts();
    }
  }, []);

  if(posts) {
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

        <IonLoading spinner='dots' message={loadingMessage} duration={0} isOpen={busy}></IonLoading>

          <IonHeader class="ion-no-border" style={ionHeaderStyle}>
            <Header />
          </IonHeader> 
                    
          <IonModal swipeToClose={true} backdropDismiss={false} isOpen={showModal} >
            <div className='ion-modal'>
              <IonTextarea color='secondary' maxlength={200} style={ionInputStyle} value={message} placeholder="Start typing..." id="message" onIonChange={(e: any) => { handleChange(e); }} ></IonTextarea>
              <IonFab class='ion-fab' horizontal='start'>
                <IonFabButton onClick={takePicture} mode='ios' color='medium'>
                  <IonIcon icon={cameraOutline} />
                </IonFabButton>
              </IonFab>
              <IonFab horizontal="end">
                <IonButton onClick={() => { setShowModal(false); setPhoto(null); }}  color="danger" mode='ios' shape="round" fill="outline" id="close" > Close </IonButton>
                <IonButton onClick={() => { handleSendMessage(); }} color="transparent" mode='ios' shape="round" fill="outline" id="message" >Send</IonButton>
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
                {/* <IonButton onClick={() => { setShowModalPicture(false);}}  color="danger" mode='ios' shape="round" fill="outline" id="close" >X</IonButton> */}
              </IonCard>
          </IonModal>

          <IonModal backdropDismiss={false} isOpen={showModalComment}>
            <IonContent>
            <div className='ion-modal'>
              <IonFab horizontal="end">
                <IonButton onClick={() => { setShowModalComment(false); setComment(""); }}  color="danger" mode='ios' shape="round" fill="outline" id="close" >X</IonButton>
              </IonFab>
              <br></br><br></br><br></br>
              {commentModalMessage && commentModalMessage.length > 0 ? (
                <div>
                <IonList inset={true}>
                  <IonItem lines='none' >
                    <IonLabel class='ion-text-wrap'>
                      <IonText color='medium'>
                      <p>{commentModalUserName}</p>
                      </IonText>
                      <h2 className='h2-message'>{commentModalMessage}</h2>
                    </IonLabel>
                    <div className='verticalLineInOriginalMessage'></div>
                  </IonItem>
                </IonList>
                <div className='verticalLine'></div>
                </div>
              ) : null}
              {comments && comments.length > 0? (
                comments?.map((comment, index) => 
                  <IonList inset={true} key={index}>
                     <IonItem lines='none' >
                        <IonLabel class="ion-text-wrap">
                          <IonText color='medium'>
                          <p> {comment.userName} </p>
                          </IonText>
                          <h2 className='h2-message'> {comment.comment} </h2>
                          {comment.url.length > 0 ? (
                          <div className="ion-img-container">
                            <br></br>
                            <IonImg  onClick={() => {showPicture(comment.imgSrc)}} src={comment.imgSrc}/>
                          </div>
                          ) : null}
                        </IonLabel>
                        <div className='verticalLineInComments'></div>
                      </IonItem>
                      <IonItem lines='none' mode='ios'>
                        <IonButton mode='ios' fill='outline' color='medium' onClick={handleUpVote}>
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
                <IonLabel class="ion-text-wrap" onClick={(e) => {handleCommentModal(post, e)}}>
                  <IonText color='medium'>
                    <p> {post.userName} </p>
                  </IonText>          
                  <h2 className='h2-message'> {post.message} </h2>
                  {post.url.length > 0 ? (
                  <div className="ion-img-container">
                    <br></br>
                    <IonImg onClick={() => {showPicture(post.imgSrc)}} src={post.imgSrc}/>
                  </div>
                  ) : null}
                </IonLabel>
              </IonItem>
              <IonItem lines='none' mode='ios'>
              <IonButton mode='ios' fill='outline' color='medium' onClick={handleUpVote}>
                  <KeyboardArrowUpIcon />
                  <p>{post.upVotes} </p>
                </IonButton>
                <p>&nbsp;</p>
                <IonButton mode='ios' color='medium' onClick={(e) => {handleCommentModal(post, e)}}>
                  <IonIcon icon={chatbubblesOutline}/>
                  <p>&nbsp; {post.commentAmount} </p>
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
    return( <IonLoading spinner='dots' message={loadingMessage} duration={0} isOpen={busy}></IonLoading> 
    );
  }
}

export default React.memo(Home);
