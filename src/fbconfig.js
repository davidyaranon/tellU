import { initializeApp } from "firebase/app";
import "firebase/compat/firestore";
import { getStorage, deleteObject, ref, uploadBytes, getDownloadURL, } from "firebase/storage";
import {
  clearIndexedDbPersistence,
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
  arrayRemove,
  addDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  getAuth,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  initializeAuth,
  indexedDBLocalPersistence,
} from "firebase/auth";
import { Capacitor } from '@capacitor/core';
import { inputClasses } from "@mui/material";

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

const auth = Capacitor.isNativePlatform
  ?
  initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  })
  :
  getAuth();

export default auth;
export const functions = getFunctions(app);
export const db = getFirestore(app);
export const storage = getStorage();

function timeout(delay) {
  return new Promise((res) => setTimeout(res, delay));
}

export const addTestMessage = httpsCallable(functions, 'addNewDoc');
export const toUpperFirestoreDoc = httpsCallable(functions, 'makeUppercase');

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
    console.log(err);
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
          bio: "",
          snapchat: "",
          instagram: "",
          tiktok: "",
          userName: name,
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
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
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
        let imgSrc = "";
        let lat = 0;
        let long = 0;
        let marker = false;
        if (blob) {
          url = "images/" + auth.currentUser.uid.toString() + id;
          imgSrc = await getDownloadURL(ref(storage, url));
        }
        if (pos) {
          lat = pos.coords.latitude;
          long = pos.coords.longitude;
          marker = true;
        }
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
            photoURL: auth.currentUser.photoURL,
            location: [lat, long],
            postType: postType,
            imgSrc: imgSrc,
            marker: marker,
          }
        );
        await setDoc(
          doc(
            db,
            "schoolPosts",
            school.replace(/\s+/g, ""),
            "comments",
            docRef.id
          ),
          {
            commentsArr: {},
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

export const getYourPolls = async (schoolName, userUid) => {
  try {
    if (auth && db) {
      const pollsRef = collection(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "polls");
      const q = query(pollsRef, where("uid", "==", userUid), orderBy("timestamp", "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      let yourPolls = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        yourPolls.push({
          ...doc.data(),
          key: doc.id,
        });
      }
      return yourPolls;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function getAllPostsNextBatch(schoolName, key) {
  try {
    if (auth.currentUser != null && db) {
      const allPostsRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts"
      );
      const q = query(allPostsRef, orderBy("timestamp", "desc"), startAfter(key), limit(50));
      const querySnapshot = await getDocs(q);
      const allPosts = [];
      const docs = querySnapshot.docs;
      let lastKey = "";
      for (const doc of docs) {
        allPosts.push({
          ...doc.data(),
          key: doc.id,
        });
        lastKey = doc.data().timestamp;
      }
      return { allPosts, lastKey };
      // return tempArr;
    }
  } catch (err) {
    console.log(err);
    let allPosts = [];
    let lastKey = "";
    return { allPosts, lastKey };
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
      const allPosts = [];
      const docs = querySnapshot.docs;
      let lastKey = "";
      for (const doc of docs) {
        allPosts.push({
          ...doc.data(),
          key: doc.id,
        });
        lastKey = doc.data().timestamp;
      }
      return { allPosts, lastKey };
    }
  } catch (err) {
    console.log(err);
    let allPosts = [];
    let lastKey = "";
    return { allPosts, lastKey };
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

export const getUserLikedPosts = async (uid) => {
  try {
    const userLikesRef = collection(db, "userData", uid, "likes");
    const q = query(userLikesRef, orderBy("likeTimestamp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    let userLikes = [];
    let lastKey = "";
    const docs = querySnapshot.docs;
    for (const doc of docs) {
      userLikes.push({
        ...doc.data(),
        key: doc.id,
      });
      lastKey = doc.data().likeTimestamp;
    }
    return { userLikes, lastKey };
  } catch (err) {
    console.log(err);
  }
}

export const getUserLikedPostsNextBatch = async (uid, key) => {
  try {
    const userLikesRef = collection(db, "userData", uid, "likes");
    const q = query(userLikesRef, orderBy("likeTimestamp", "desc"), startAfter(key), limit(10));
    const querySnapshot = await getDocs(q);
    let userLikes = [];
    let lastKey = "";
    const docs = querySnapshot.docs;
    for (const doc of docs) {
      userLikes.push({
        ...doc.data(),
        key: doc.id,
      });
      lastKey = doc.data().likeTimestamp;
    }
    return { userLikes, lastKey };
  } catch (err) {
    console.log(err);
  }
}

export const updateUserInfo = async (bio, instagram, major, snapchat, tiktok) => {
  try {
    if (db && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const batch = writeBatch(db);
      const userDocRef = doc(db, "userData", uid);
      batch.update(userDocRef, {
        bio: bio,
        instagram: instagram,
        major: major,
        snapchat: snapchat,
        tiktok: tiktok
      });
      await batch.commit().catch((err) => console.log(err));
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const getUserPosts = async (schoolName, uid) => {
  try {
    if (db) {
      const userPostsRef = collection(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "allPosts");
      const q = query(userPostsRef, orderBy("timestamp", "desc"), where("uid", "==", uid), limit(10));
      const qSnap = await getDocs(q);
      let userPosts = [];
      let lastKey = "";
      const docs = qSnap.docs;
      for (const doc of docs) {
        userPosts.push({
          ...doc.data(),
          key: doc.id,
        });
        lastKey = doc.data().timestamp;
      }
      return { userPosts, lastKey };
    }
  } catch (err) {
    console.log(err);
  }
}

export const getNextBatchUserPosts = async (schoolName, uid, key) => {
  try {
    if (db) {
      const userPostsRef = collection(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "allPosts");
      const q = query(userPostsRef, orderBy("timestamp", "desc"), where("uid", "==", uid), startAfter(key), limit(5));
      const qSnap = await getDocs(q);
      let userPosts = [];
      let lastKey = "";
      const docs = qSnap.docs;
      for (const doc of docs) {
        userPosts.push({
          ...doc.data(),
          key: doc.id,
        });
        lastKey = doc.data().timestamp;
      }
      return { userPosts, lastKey };
    }
  } catch (err) {
    console.log(err);
  }
}

export const getOnePost = async (postKey, schoolName) => {
  try {
    if (db) {
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey
      );
      const snap = await getDoc(postDocRef);
      if (snap.exists) {
        return snap.data();
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export const getCurrentUserData = async () => {
  try {
    if (db && auth && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userDoc = doc(db, "userData", uid);
      const res = await getDoc(userDoc);
      if (res.exists) {
        return res.data();
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export const getUserData = async (uid) => {
  try {
    if (auth && db) {
      let temp = [];
      const usersRef = doc(db, "userData", uid.toString());
      const res = await getDoc(usersRef);
      if (res.exists()) {
        // temp.push({
        //   ...res.data(),
        //   key: doc.id,
        // });
        return { ...res.data(), key: doc.id }
      }
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

export const getPolls = async (schoolName) => {
  try {
    if (auth && db) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      tomorrow.setDate(sevenDaysAgo.getDate() + 9);
      const pollsRef = collection(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "polls");
      const q = query(pollsRef, where("timestamp", ">", sevenDaysAgo), where("timestamp", "<", tomorrow), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      let polls = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        polls.push({
          ...doc.data(),
          key: doc.id,
        });
      }
      return polls;
    }
  } catch (err) {
    console.log(err);
  }
}

export const submitPollFb = async (pollText, pollOptions, schoolName, userName, userUid) => {
  try {
    if (auth && db) {
      const pollsRef = collection(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "polls");
      await addDoc(pollsRef, {
        question: pollText,
        options: pollOptions,
        userName: userName,
        timestamp: serverTimestamp(),
        votes: 0,
        voteMap: {},
        results: [0, 0, 0, 0, 0, 0],
        uid: userUid,
      }).catch((err) => {
        console.log(err);
        return false;
      });
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const getTopWeeklyPosts = async (schoolName) => {
  try {
    if (auth && db) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      tomorrow.setDate(sevenDaysAgo.getDate() + 9);
      const allPostsRef = collection(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "allPosts");
      const q = query(allPostsRef, where("timestamp", ">", sevenDaysAgo), where("timestamp", "<", tomorrow), limit(15));
      const querySnapshot = await getDocs(q);
      let topWeeklyPosts = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        topWeeklyPosts.push({
          key: doc.id,
          data: doc.data(),
        });
      }
      return topWeeklyPosts;
    }
  } catch (err) {
    console.log(err);
  }
}

export const getTopPostsWithinPastDay = async (schoolName) => {
  try {
    if (auth && db) {
      const allPostsRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts"
      );
      const q = query(allPostsRef, orderBy("upVotes", "desc"), limit(15));
      const querySnapshot = await getDocs(q);
      const topPosts = [];
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        topPosts.push({
          key: doc.id,
          data: doc.data(),
        });
      }
      return topPosts;
    }
  } catch (err) {
    console.log(err);
  }
};

export const pollVote = async (schoolName, index, postKey, userUid) => {
  try {
    if (auth && db) {
      console.log(postKey);
      console.log(index);
      console.log(schoolName);
      console.log(userUid);
      const pollsDocRef = doc(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "polls", postKey);
      const snap = await getDoc(pollsDocRef);
      if (snap.exists) {
        if ("voteMap" in snap.data() && snap.data().voteMap[userUid] === undefined) {
          let tempResults = [...snap.data().results];
          tempResults[index] += 1;
          await updateDoc(pollsDocRef, {
            [`voteMap.${userUid}`]: index,
            votes: increment(1),
            results: tempResults,
          }).catch((err) => { console.log(err); });
          return true;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export const downVoteComment = async (schoolName, postKey, commentKey) => {
  try {
    if (db && auth && auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const commentDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey,
        "comments",
        commentKey
      );
      let inc = 0;
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(commentDocRef);
        if (snap.exists) {
          if (snap.data().dislikes[userUid]) {
            transaction.update(commentDocRef, {
              [`dislikes.${userUid}`]: deleteField(),
              downVotes: increment(-1),
            });
            inc = -1;
          } else {
            if (snap.data().likes[userUid]) {
              transaction.update(commentDocRef, {
                dislikes: { [`${userUid}`]: true },
                downVotes: increment(1),
                [`likes.${userUid}`]: deleteField(),
                upVotes: increment(-1),
              });
            } else {
              transaction.update(commentDocRef, {
                dislikes: { [`${userUid}`]: true },
                downVotes: increment(1),
              });
            }
            inc = 1;
          }
        }
      });
      return inc;
    }
  } catch (err) {
    console.log(err);
  }
}

export const upVoteComment = async (schoolName, postKey, commentKey) => {
  try {
    if (db && auth && auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const commentDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey,
        "comments",
        commentKey
      );
      let inc = 0;
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(commentDocRef);
        if (snap.exists) {
          if (snap.data().likes[userUid]) {
            transaction.update(commentDocRef, {
              [`likes.${userUid}`]: deleteField(),
            });
            inc = -1;
          } else {
            if (snap.data().dislikes[userUid]) {
              transaction.update(commentDocRef, {
                [`dislikes.${userUid}`]: deleteField(),
                likes: { [`${userUid}`]: true },
                upVotes: increment(1),
                downVotes: increment(-1),
              });
            } else {
              transaction.update(commentDocRef, {
                likes: { [`${userUid}`]: true },
                upVotes: increment(1),
              });
            }
            inc = 1;
          }
        }
      });
      return inc;
    }
  } catch (err) {
    console.log(err);
  }
}

export const upVote = async (schoolName, postKey, post) => {
  try {
    if (db && auth && auth.currentUser) {
      const batch = writeBatch(db);
      const userUid = auth.currentUser.uid;
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey
      );
      const userLikesDocRef = doc(
        db,
        "userData",
        userUid,
        "likes",
        postKey
      );
      const snap = await getDoc(postDocRef);
      if (snap.exists) {
        if (snap.data().likes[userUid]) {
          batch.update(postDocRef, {
            [`likes.${userUid}`]: deleteField(),
            upVotes: increment(-1),
          });
          batch.delete(userLikesDocRef);
          await batch.commit().catch((err) => { console.log(err); });
          return -1;
        } else {
          if (snap.data().dislikes[userUid]) {
            batch.update(postDocRef, {
              [`dislikes.${userUid}`]: deleteField(),
              likes: { [`${userUid}`]: true },
              upVotes: increment(1),
              downVotes: increment(-1),
            });
          } else {
            batch.update(postDocRef, {
              likes: { [`${userUid}`]: true },
              upVotes: increment(1),
            });
          }
          batch.set(userLikesDocRef, {
            imgSrc: post.imgSrc,
            message: post.message,
            photoURL: post.photoURL,
            timestamp: post.timestamp,
            likeTimestamp: serverTimestamp(),
            uid: post.uid,
            userName: post.userName,
            postType: post.postType,
          });
          await batch.commit().catch((err) => { console.log(err); });
          return 1;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const downVote = async (schoolName, postKey, post) => {
  try {
    if (auth && auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const batch = writeBatch(db);
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey
      );
      const userLikesDocRef = doc(
        db,
        "userData",
        userUid,
        "likes",
        postKey
      );
      const snap = await getDoc(postDocRef);
      if (snap.exists) {
        if (snap.data().dislikes[userUid]) {
          batch.update(postDocRef, {
            [`dislikes.${userUid}`]: deleteField(),
            downVotes: increment(-1),
          });
          await batch.commit().catch((err) => { console.log(err); });
          return -1;
        } else {
          if (snap.data().likes[userUid]) {
            batch.update(
              postDocRef,
              {
                dislikes: { [`${userUid}`]: true },
                downVotes: increment(1),
                [`likes.${userUid}`]: deleteField(),
                upVotes: increment(-1),
              }
            );
            batch.delete(userLikesDocRef);
          } else {
            batch.update(
              postDocRef,
              {
                dislikes: { [`${userUid}`]: true },
                downVotes: increment(1),
              });
          }
          await batch.commit().catch((err) => { console.log(err); });
          return 1;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};
///schoolPosts/UCBerkeley/allPosts/IsfZKvyHB9pWIElkzzDt/comments
export const addCommentNew = async (postKey, schoolName, commentString) => {
  try {
    if (auth && auth.currentUser && db) {
      const uid = auth.currentUser.uid;
      const userName = auth.currentUser.displayName;
      const photoURL = auth.currentUser.photoURL;
      const commentsRef = collection(db, "schoolPosts", schoolName.replace(/\s+/g, ""),
        "allPosts", postKey, "comments");
      const postRef = doc(db, "schoolPosts", schoolName.replace(/\s+/g, ""), "allPosts", postKey);
      const addedDoc = await addDoc(commentsRef, {
        comment: commentString,
        photoURL: photoURL,
        userName: userName,
        uid: uid,
        likes: {},
        dislikes: {},
        timestamp: serverTimestamp(),
      });
      await updateDoc(postRef, {
        commentAmount: increment(1),
      });
      return {
        comment: commentString,
        photoURL: photoURL,
        userName: userName,
        uid: uid,
        likes: {},
        dislikes: {},
        timestamp: serverTimestamp(),
        key: addedDoc.id,
      };
    }
  } catch (err) {
    console.log(err);
  }
}

export const addComment = async (postKey, schoolName, commentString) => {
  try {
    if (auth && auth.currentUser) {
      const userUid = auth.currentUser.uid;
      const userName = auth.currentUser.displayName;
      const photoURL = auth.currentUser.photoURL;
      const postRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey
      );
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "comments",
        postKey
      );
      const commentSnap = await getDoc(postDocRef);
      if (commentSnap.exists && commentSnap.data().commentsArr) {
        await updateDoc(postDocRef, {
          commentsArr: arrayUnion({
            comment: commentString,
            photoURL: photoURL,
            userName: userName,
            upVotes: 0,
            downVotes: 0,
            uid: userUid,
          })
        });
        const postSnap = await getDoc(postRef);
        if (postSnap.exists) {
          await updateDoc(postRef, {
            commentAmount: increment(1),
          });
          return true;
        } else {
          console.log(postSnap.data());
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const removePost = async (postKey, schoolName, postUrl) => {
  try {
    const postRef = doc(
      db,
      "schoolPosts",
      schoolName.replace(/\s+/g, ""),
      "allPosts",
      postKey
    );
    const postDocRef = doc(
      db,
      "schoolPosts",
      schoolName.replace(/\s+/g, ""),
      "comments",
      postKey
    );
    const batch = writeBatch(db);
    batch.delete(postRef);
    batch.delete(postDocRef);
    await batch.commit().catch((err) => console.log(err));
    if (postUrl.length > 0) {
      const pictureRef = ref(storage, postUrl);
      await deleteObject(pictureRef).catch((err) => console.log(err));
    }
    return true;
  } catch (err) {
    console.log(err);
  }
}

export const removeCommentNew = async (comment, schoolName, postKey) => {
  try {
    if (db) {
      const commentKey = comment.key;
      const commentRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey,
        "comments",
        commentKey
      );
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey,
      );
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(postDocRef);
        if (snap.exists()) {
          transaction.update(postDocRef, {
            commentAmount: increment(-1),
          });
        }
        transaction.delete(commentRef);
      });
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

export const removeComment = async (comment, schoolName, postKey) => {
  try {
    const postRef = doc(
      db,
      "schoolPosts",
      schoolName.replace(/\s+/g, ""),
      "allPosts",
      postKey
    );
    const postDocRef = doc(
      db,
      "schoolPosts",
      schoolName.replace(/\s+/g, ""),
      "comments",
      postKey
    );
    const commentSnap = await getDoc(postDocRef);
    if (commentSnap.exists) {
      await updateDoc(postDocRef, {
        commentsArr: arrayRemove(comment)
      });
      const postSnap = await getDoc(postRef);
      if (postSnap.exists) {
        await updateDoc(postRef, {
          commentAmount: increment(-1),
        });
        return true;
      } else {
        console.log(postSnap.data());
      }
    }
  } catch (err) {
    console.log(err);
  }

}
// /schoolPosts/UCDavis/allPosts/xGhnEiKAGyMSbiQIDPeW/comments/5nVNdPGw0lAJBCSH3l0i
export const loadCommentsNew = async (postKey, schoolName) => {
  try {
    if (auth && auth.currentUser) {
      const commentsRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey,
        "comments"
      );
      const q = query(commentsRef, orderBy("timestamp", "asc"), limit(20));
      const querySnapshot = await getDocs(q);
      let comments = [];
      let lastKey = "";
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        comments.push({
          ...doc.data(),
          key: doc.id,
        });
        lastKey = doc.data().timestamp;
      }
      return { comments, lastKey };
    }
  } catch (err) {
    console.log(err);
  }
}

export const loadCommentsNewNextBatch = async (postKey, schoolName, key) => {
  try {
    if (auth && auth.currentUser) {
      const commentsRef = collection(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "allPosts",
        postKey,
        "comments"
      );
      const q = query(commentsRef, orderBy("timestamp", "asc"), startAfter(key), limit(20));
      const querySnapshot = await getDocs(q);
      let comments = [];
      let lastKey = "";
      const docs = querySnapshot.docs;
      for (const doc of docs) {
        comments.push({
          ...doc.data(),
          key: doc.id,
        });
        lastKey = doc.data().timestamp;
      }
      return { comments, lastKey };
    }
  } catch (err) {
    console.log(err);
  }
}

export const loadComments = async (postKey, schoolName) => {
  try {
    if (auth && auth.currentUser) {
      const postDocRef = doc(
        db,
        "schoolPosts",
        schoolName.replace(/\s+/g, ""),
        "comments",
        postKey
      );
      const snap = await getDoc(postDocRef);
      if (snap.exists) {
        if (snap.data()) return snap.data().commentsArr;
      }
    }
  } catch (err) {
    console.log(err);
  }
}
