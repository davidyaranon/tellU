import { initializeApp } from 'firebase/app';
import { serverTimestamp } from '@firebase/firestore'
import 'firebase/compat/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs,  query, orderBy, limit, doc, getDoc, getFirestore, setDoc, where, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { getAuth, updateProfile, sendPasswordResetEmail, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAHV2ukGyxwx_8wADQSd4QXV1rRiU93L44",
  authDomain: "quantum-61b84.firebaseapp.com",
  projectId: "quantum-61b84",
  storageBucket: "quantum-61b84.appspot.com",
  messagingSenderId: "461090594003",
  appId: "1:461090594003:web:5cb1cac4a16e9031140826",
  measurementId: "G-JRZ1RJ4P89"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage();

function timeout(delay) {
  return new Promise( res => setTimeout(res, delay) );
}

export async function uploadImage(blob, url) {
  try {
    const currentUserUid = auth.currentUser.uid;
    const storageRef = ref(storage, "images/" + auth.currentUser.uid.toString() + url);
    const res = await uploadBytes(storageRef, blob).then((snapshot) => {
      // console.log('uploaded file somehow lol');
    });
    return true;
  } catch(err) {
    console.log(err.message);
    return false;
  }
}

export async function logInWithEmailAndPassword(email, password){
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res;
    } catch (err) {
      return false;
    }
  };

export async function registerWithEmailAndPassword (name, email, password, school){
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if(res) {
        const user = res.user;
        await updateProfile(user, {
          'displayName': name
        })
        try {
          await setDoc(doc(db, "userData", user.uid.toString()), {
            userName: name,
            listOfPosts: [],
            userEmail: email,
            uid: user.uid,
            school: school
          });
        } catch(docErr) {
          console.log(docErr);
        }
        return res;
      }
    } catch (err) {
      return err.message.toString();
    }
  };

export const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

export const logout = async () => {
  try {
    await signOut(auth);
    return 'true';
  } catch(err) {
    const theError = err.message.toString();
    return theError;
  }
    
  };

export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(function(user) {
      if(user) {
        resolve(user);
      }
      else {
        resolve(null);
      }
      unsubscribe();
    });
  })
}

export const addComment = async (comment) => {
  try {
    if(auth.currentUser != null) {
      if(auth.currentUser.uid != null) {
        var name = auth.currentUser.displayName;
        const userListOfPosts = doc(db, "userData", auth.currentUser.uid);
        const snap = await getDoc(userListOfPosts);
        return 'true';
      }
      else {
        console.log("uid missing");
      }
    }
    else {
      console.log("currentUser missing");
    }
  } catch(err){
    console.log(err.message);
    return 'false';
  }
}

export const addMessage = async (mess, blob, id) => {
  try {
    if(auth.currentUser != null) {
      if(auth.currentUser.uid != null) {
        var name = auth.currentUser.displayName;
        const userListOfPosts = doc(db, "userData", auth.currentUser.uid);
        const snap = await getDoc(userListOfPosts);
        var url = "";
        if(blob) { 
          url = 'images/' + auth.currentUser.uid.toString() + id;
        }
        await updateDoc(userListOfPosts, {
          listOfPosts: arrayUnion({timestamp: snap.data().listOfPosts.length, message: mess, url: url, uid: auth.currentUser.uid, comments: [{timestamp: 0, message: "", url: ""}], upVotes: 0, downVotes: 0})
        });
        await addDoc(collection(db, "allPosts"), {
          userName: name,
          timestamp: serverTimestamp(), 
          message: mess, 
          url: url,
          uid: auth.currentUser.uid,
          commentAmount: 0,
          upVotes: 0,
          downVotes: 0,
          comments: [],
        });
        return 'true';
      }
      else {
        console.log("uid missing");
      }
    }
    else {
      console.log("currentUser missing");
    }
  } catch(err){
    console.log(err.message);
    return 'false';
  }
}

export async function checkUsernameUniqueness(userName) {
  try {
    if(db) {
      const usersRef = collection(db, "userData");
      const q = query(usersRef, where('userName', '==', userName));
      const snap = await getDocs(q);
      if(snap.empty) {
        return true;
      } else {
        return false;
      }
    } else {
      console.log("auth not defined");
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}


export async function getAllPosts() {
  try {
    if(auth.currentUser != null && db) { 
      const allPostsRef = collection(db, "allPosts");
      const q = query(allPostsRef, orderBy("timestamp", "desc"), limit(250));
      const querySnapshot = await getDocs(q);
      const tempArr = [];
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
      return tempArr;
    }
  } catch(err) {
    console.log(err);
    return [];
  }
}
