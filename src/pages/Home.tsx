import { IonContent, IonHeader, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonItemDivider,
  IonInfiniteScrollContent,  IonModal, IonImg, IonList, IonItem, IonLabel, IonTextarea, IonLoading, 
  IonInput, IonActionSheet, IonButton, IonIcon, IonRippleEffect, IonFab, IonFabButton, useIonViewWillEnter } 
from '@ionic/react';
import React, { useRef, useCallback } from 'react';
import { RefresherEventDetail } from '@ionic/core';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth, getCurrentUser, logout, addMessage, storage, uploadImage, addComment } from '../fbconfig'
import Header from './Header'
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
import { useDispatch } from "react-redux"
import { setUserState } from '../redux/actions';

export interface UserPhoto {
  filepath: string,
  webviewPath?: string;
}

defineCustomElements(window);

function Home() {
  const dispatch = useDispatch();
  const hasLoaded = useSelector( (state: any) => state.user.hasLoaded);
  const [busy, setBusy] = useState<boolean>(false);
  const [photo, setPhoto] = useState<Photo | null>();
  const Toast = useToast();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalPicture, setShowModalPicture] = useState<boolean>(false);
  const [showModalComment, setShowModalComment] = useState<boolean>(false);
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
  const isInitialMount = useRef(true);
  const [user] = useAuthState(auth);
  const getPostsFromFirebase : any[] = [];
  const ionHeaderStyle = {
    textAlign: 'center',
    padding: "5vh",
  };
  const ionInputStyle = {
    height: "10vh",
    width: "95vw",
    marginLeft: "2.5vw",
  }

  async function commentAdd() {
    if(message.trim().length == 0){
      Toast.error("Input a comment");
    }
    else {
      setBusy(true);
      const res = addComment(comment.trim());
    }
  }

  async function messageAdd() {
    if(message.trim().length == 0 && !blob) {
      Toast.error("Input a message!");
    }
    else {
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
      }
      else {
        Toast.success("Uploaded!");
        setMessageSent(true);
        await getAllPosts();
      }
      setShowModal(false);
      setBusy(false);
    }
    setMessage("");
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

  function timeout(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
  }

  // const savePicture = async (photo: Photo, fileName: string, blob: any) : Promise<UserPhoto> => {
  //   const base64Data = await base64FromPath(photo.webPath!);
  //   const savedFile = await Filesystem.writeFile({
  //     path: fileName,
  //     data: base64Data,
  //     directory: Directory.Data,
  //   });

  //   return {
  //     filepath: fileName, 
  //     webviewPath: photo.webPath,
  //   }
  // }

  // async function base64FromPath(path: string) : Promise<string> {
  //   const response = await fetch(path);
  //   const blob = await response.blob();
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onerror = reject;
  //     reader.onload = () => {
  //       if (typeof reader.result === 'string') {
  //         resolve(reader.result);
  //       } else {
  //         reject('method did not return a string');
  //       }
  //     };
  //     reader.readAsDataURL(blob);
  //   });
  // }

  async function takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        source: CameraSource.Camera,
        resultType: CameraResultType.Uri,
      });
      // const fileName = new Date().getTime() + '.jpeg';
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      // const savedFileImage = await savePicture(photo!, fileName, blobRes);
      if(blobRes) {
        if(blobRes.size > 3000000) {
          Toast.error("Image too large")
        }
        else {
          setBlob(blobRes);
          setPhoto(image);
          setLoading(true);
          await timeout(1000);
          setLoading(false);
        }
      }
    } catch(err : any) {
      Toast.error(err.message.toString());
    }
  }

  async function sendImage(blob: any, uniqueId : string) {
    const res = await uploadImage(blob, uniqueId);
    if(!res || photo == null || photo?.webPath == null) {
      Toast.error("unable to select photo");
    }
    else {
      Toast.success("photo uplaoded successfully");
    }
  }

  // function postComment() {}
  // leaveUpVote() {}
  // leaveDownVote() {}
  // openComments() {}

  const handleUpVote = () => {
    console.log('upvoted!');
  }

  const handleDownVote = () => {
    console.log('downvoted!');
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

  const getAllPosts = useCallback(async()=>{
    try {
      setBusy(true);
      if(user && db) { 
        console.log(user);
        const allPostsRef = collection(db, "allPosts");
        const q = query(allPostsRef, orderBy("timestamp", "desc"), limit(250));
        const querySnapshot = await getDocs(q);
        const tempArr : any[] = [];
        const docs = querySnapshot.docs;
        for(const doc of docs) {
          let res = "";
          let url = doc.data().url;
          if(url.length > 0) {
            res = await getDownloadURL(ref(storage, url));
          }
          tempArr.push({
            ...doc.data(),
            key: doc.id,
            imgSrc: res,
          });
        }
        setPosts(tempArr);
        console.log(tempArr);
      }
      setBusy(false);
    } catch(err : any) {
      Toast.error(err.message.toString());
      setBusy(false);
    }
  }, [])
    

  async function doRefresh(event: CustomEvent<RefresherEventDetail> ) {
    await getAllPosts();
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  }

  function showPicture(src : string) {
    setModalImgSrc(src);
    setShowModalPicture(true);
  }

  useEffect(() => {
    // if(!hasLoaded) {
    //   dispatch(setUserState(user!.displayName, user!.email, true));
    getAllPosts();
   // }
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

        <IonLoading spinner='dots' message="Please wait..." duration={0} isOpen={busy}></IonLoading>

          <IonHeader class="ion-no-border" style={ionHeaderStyle}>
            <Header />
          </IonHeader> 
                    
          <IonModal backdropDismiss={false} isOpen={showModal} >
            <div className='ion-modal'>
              <IonTextarea maxlength={200} style={ionInputStyle} value={message} placeholder="Start typing..." id="message" onIonChange={(e: any) => { handleChange(e); }} ></IonTextarea>
              <IonFab class='ion-fab' horizontal='start'>
                <IonFabButton onClick={takePicture} mode='ios' color='transparent'>
                  <IonIcon icon={cameraOutline} />
                </IonFabButton>
              </IonFab>
              <IonFab horizontal="end">
                <IonButton onClick={() => { setShowModal(false); setPhoto(null); }}  color="danger" mode='ios' shape="round" fill="outline" id="close" > Close </IonButton>
                <IonButton onClick={() => { handleSendMessage(); }} color="transparent" mode='ios' shape="round" fill="outline" id="message" >Send</IonButton>
              </IonFab>
              <IonImg src={photo?.webPath} />
            </div>
          </IonModal>
          <IonFab vertical="bottom" horizontal="end" slot="fixed" >
            <IonFabButton onClick={() => {setShowModal(true); }}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          <IonModal backdropDismiss={false} isOpen={showModalPicture}>
            <div className='ion-modal'>
              <IonImg className='ion-image-modal' src={modalImgSrc} />
              <IonFab horizontal="end">
                <IonButton onClick={() => { setShowModalPicture(false);}}  color="danger" mode='ios' shape="round" fill="outline" id="close" >X</IonButton>
              </IonFab>
            </div>
          </IonModal>

          <IonModal backdropDismiss={false} isOpen={showModalComment}>
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
                      <p>{commentModalUserName}</p>
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
                          <p> {comment.userName} </p>
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
                  </IonList>
                )
              ) : null}
              <IonTextarea spellcheck={true} maxlength={200} style={ionInputStyle} value={comment} placeholder="Leave a comment..." id="message" onIonChange={(e: any) => { handleChangeComment(e); }} ></IonTextarea>
            </div>
          </IonModal>
          
          {posts!.length > 0 ? (
            posts?.map((post) => 
            <IonList inset={true} mode='ios' key={post.key}>
              <IonItem lines='none' mode='ios' >
                <IonLabel class="ion-text-wrap" onClick={(e) => {handleCommentModal(post, e)}}>
                  <p> {post.userName} </p>
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
              <IonButton mode='ios' color='transparent' onClick={handleUpVote}>
                  <KeyboardArrowUpIcon />
                  <p>{post.upVotes} </p>
                </IonButton>
                <p>&nbsp;</p>
                <IonButton mode='ios' color='transparent' onClick={(e) => {handleCommentModal(post, e)}}>
                  <IonIcon icon={chatbubblesOutline}/>
                  <p>&nbsp; {post.commentAmount} </p>
                </IonButton>
                <IonButton mode='ios' color='transparent'>
                  <KeyboardArrowDownIcon />
                  <p>{post.downVotes} </p>
                </IonButton>
              </IonItem>
            </IonList>
            )
          ) : <div>
                <h3 className='h3-error'> Unable to load posts, check your internet connection </h3>
                <div className='h3-error'>
                  <SignalWifiOff fontSize="large" style={{fontSize: '4.10vh'}}/>
                </div>
              </div>}

        </IonContent>
      </React.Fragment>
    );
  }
  else {
    return( <IonLoading spinner='dots' message="Please wait..." duration={0} isOpen={busy}></IonLoading> 
    );
  }
}

export default React.memo(Home);

//"images/RIOzmEqpRONL6ty5L34KqiAlvwH205f297fa-6dcf-498b-900c-dab69a1a4e93"
//https://firebasestorage.googleapis.com/v0/b/quantum-61b84.appspot.com/o/images%2FRIOzmEqpRONL6ty5L34KqiAlvwH205f297fa-6dcf-498b-900c-dab69a1a4e93