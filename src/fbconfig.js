import { initializeApp } from "firebase/app";
import "firebase/compat/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  WriteBatch,
  deleteField,
  serverTimestamp,
  increment,
  collection,
  getDocs,
  startAfter,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  where,
  updateDoc,
  arrayUnion,
  addDoc,
} from "firebase/firestore";
import {
  getAuth,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHV2ukGyxwx_8wADQSd4QXV1rRiU93L44",
  authDomain: "quantum-61b84.firebaseapp.com",
  projectId: "quantum-61b84",
  storageBucket: "quantum-61b84.appspot.com",
  messagingSenderId: "461090594003",
  appId: "1:461090594003:web:5cb1cac4a16e9031140826",
  measurementId: "G-JRZ1RJ4P89",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage();

function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

export async function uploadImage(location, blob, url) {
  try {
    const currentUserUid = auth.currentUser.uid;
    const storageRef = ref(
      storage,
      location + "/" + currentUserUid.toString() + url
    );
    const res = await uploadBytes(storageRef, blob)
      .then((snapshot) => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

export async function logInWithEmailAndPassword(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res;
  } catch (err) {
    return false;
  }
}

export async function registerWithEmailAndPassword(
  name,
  email,
  password,
  school
) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res) {
      const user = res.user;
      await updateProfile(user, {
        displayName: name,
        photoURL:
          "https://firebasestorage.googleapis.com/v0/b/quantum-61b84.appspot.com/o/profilePictures%2F301-3012952_this-free-clipart-png-design-of-blank-avatar.png?alt=media&token=90117292-9497-4b30-980e-2b17986650cd",
      });
      try {
        await setDoc(doc(db, "userData", user.uid.toString()), {
          userName: name,
          listOfPosts: [],
          userEmail: email,
          uid: user.uid,
          school: school,
          timestamp: serverTimestamp(),
        });
      } catch (docErr) {
        console.log(docErr);
      }
      return res;
    }
  } catch (err) {
    return err.message.toString();
  }
}

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
    return "true";
  } catch (err) {
    const theError = err.message.toString();
    return theError;
  }
};

export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(function (user) {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
      unsubscribe();
    });
  });
}

export const addComment = async (comment) => {
  try {
    if (auth.currentUser != null) {
      if (auth.currentUser.uid != null) {
        var name = auth.currentUser.displayName;
        const userListOfPosts = doc(db, "userData", auth.currentUser.uid);
        const snap = await getDoc(userListOfPosts);
        return "true";
      } else {
        console.log("uid missing");
      }
    } else {
      console.log("currentUser missing");
    }
  } catch (err) {
    console.log(err.message);
    return "false";
  }
};

export const addMarker = async (lat, long) => {};

export const addMessage = async (
  mess,
  blob,
  id,
  pos,
  school,
  postType = "general"
) => {
  try {
    if (auth.currentUser != null) {
      if (auth.currentUser.uid != null) {
        var name = auth.currentUser.displayName;
        const userListOfPosts = doc(db, "userData", auth.currentUser.uid);
        const snap = await getDoc(userListOfPosts);
        var url = "";
        let lat = 0;
        let long = 0;
        if (pos) {
          console.log("location given");
          lat = pos.coords.latitude;
          long = pos.coords.longitude;
          await addDoc(collection(db, "mapMarkers"), {
            userName: name,
            timestamp: serverTimestamp(),
            message: mess,
            url: url,
            uid: auth.currentUser.uid,
            location: [lat, long],
            school: school,
            postType: postType,
          });
        }
        if (blob) {
          url = "images/" + auth.currentUser.uid.toString() + id;
        }
        await updateDoc(userListOfPosts, {
          listOfPosts: arrayUnion({
            timestamp: snap.data().listOfPosts.length,
            message: mess,
            url: url,
            uid: auth.currentUser.uid,
            comments: [{ timestamp: 0, message: "", url: "" }],
            upVotes: 0,
            downVotes: 0,
            postType: postType,
          }),
        });
        const docRef = await addDoc(
          collection(db, "schoolPosts", school.replace(/\s+/g, ""), "allPosts"),
          {
            userName: name,
            timestamp: serverTimestamp(),
            message: mess,
            url: url,
            likes: {},
            dislikes: {},
            uid: auth.currentUser.uid,
            commentAmount: 0,
            upVotes: 0,
            downVotes: 0,
            comments: [],
            photoURL: auth.currentUser.photoURL,
            location: [lat, long],
            postType: postType,
          }
        );
        return "true";
      } else {
        console.log("uid missing");
      }
    } else {
      console.log("currentUser missing");
    }
  } catch (err) {
    console.log(err.message);
    return "false";
  }
};

export async function checkUsernameUniqueness(userName) {
  try {
    if (db) {
      const usersRef = collection(db, "userData");
      const q = query(usersRef, where("userName", "==", userName));
      const snap = await getDocs(q);
      if (snap.empty) {
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

export async function getAllPosts(schoolName) {
  try {
    if (auth.currentUser != null && db) {
      const allPostsRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts"
      );
      const q = query(allPostsRef, orderBy("timestamp", "desc"), limit(250));
      const querySnapshot = await getDocs(q);
      const tempArr = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        let res = "";
        let url = doc.data().url;
        if (url.length > 0) {
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
  } catch (err) {
    console.log(err);
    return [];
  }
}

export const promiseTimeout = function (ms, promise) {
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      let rejectStr = "Request timed out (" + ms + " ms)";
      reject(rejectStr);
    }, ms);
  });
  return Promise.race([promise, timeout]);
};

export const getUsers = async () => {
  try {
    if (auth && db) {
      const usersRef = collection(db, "userData");
      const q = query(usersRef, orderBy("userName", "asc"), limit(2));
      const querySnapshot = await getDocs(q);
      let userList = [];
      let lastKey = "";
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        userList.push({
          key: doc.id,
          data: doc.data(),
        });
        lastKey = doc.data().userName;
      }
      return { userList, lastKey };
    }
  } catch (err) {
    console.log(err);
  }
};

export const getNextBatchUsers = async (key) => {
  try {
    if (auth && db) {
      const usersRef = collection(db, "userData");
      const q = query(
        usersRef,
        orderBy("userName", "asc"),
        startAfter(key),
        limit(2)
      );
      const querySnapshot = await getDocs(q);
      let userList = [];
      let lastKey = "";
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        console.log(doc);
        userList.push({
          key: doc.id,
          data: doc.data(),
        });
        lastKey = doc.data().userName;
      }
      return { userList, lastKey };
    }
  } catch (err) {
    console.log(err);
  }
};

export const getTopPostsWithinPastDay = async (schoolName) => {
  try {
    if (auth && db) {
      const allPostsRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts"
      );
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      tomorrow.setDate(yesterday.getDate() + 2);
      const q = query(allPostsRef, orderBy("upVotes", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const topPosts = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        let url = doc.data().url;
        let res = "";
        if (url.length > 0) {
          res = await getDownloadURL(ref(storage, url));
        }
        topPosts.push({
          key: doc.id,
          data: doc.data(),
          imgSrc: res,
        });
      }
      return topPosts;
    }
  } catch (err) {
    console.log(err);
  }
};

export const upVote = async (schoolName, postKey) => {
  try {
    if (auth && auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey
      );
      const snap = await getDoc(postDocRef);
      if (snap.exists) {
        if (snap.data().likes[userUid]) {
          await updateDoc(postDocRef, {
            [`likes.${userUid}`]: deleteField(),
            upVotes: increment(-1),
          });
          return -1;
        } else {
          if (snap.data().dislikes[userUid]) {
            await updateDoc(postDocRef, {
              [`dislikes.${userUid}`]: deleteField(),
              likes: { [`${userUid}`]: true },
              upVotes: increment(1),
              downVotes: increment(-1),
            });
          } else {
            await setDoc(
              postDocRef,
              {
                likes: { [`${userUid}`]: true },
                upVotes: increment(1),
              },
              { merge: true }
            );
          }
          return 1;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const downVote = async (schoolName, postKey) => {
  try {
    if (auth && auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey
      );
      const snap = await getDoc(postDocRef);
      if (snap.exists) {
        if (snap.data().dislikes[userUid]) {
          await updateDoc(postDocRef, {
            [`dislikes.${userUid}`]: deleteField(),
            downVotes: increment(-1),
          });
          return -1;
        } else {
          if (snap.data().likes[userUid]) {
            await updateDoc(
              postDocRef,
              {
                dislikes: { [`${userUid}`]: true },
                downVotes: increment(1),
                [`likes.${userUid}`]: deleteField(),
                upVotes: increment(-1),
              },
              { merge: true }
            );
          } else {
            await setDoc(
              postDocRef,
              {
                dislikes: { [`${userUid}`]: true },
                downVotes: increment(1),
              },
              { merge: true }
            );
          }
          return 1;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};
