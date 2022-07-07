import React, { useState } from "react";
import { useEffect } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import  { storage } from "../fbconfig";

interface UserInfo {
  uid : string;
}

const ProfilePhoto = (props : UserInfo) => {
  const uid = props.uid;
  const [src, setSrc] = useState<string | undefined>("");

  useEffect(() => {
    if(uid) {
      getDownloadURL(ref(storage, "profilePictures/" + uid + "photoURL")).then((res) => {
        setSrc(res);
      })
    }
  }, [uid])

  return(
    <img src={src} />
  );
};

export default ProfilePhoto;