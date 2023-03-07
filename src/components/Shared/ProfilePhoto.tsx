import React, { useState } from "react";
import { useEffect } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import  { storage } from "../../fbConfig";

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
      }).catch((err) => {
        setSrc("https://firebasestorage.googleapis.com/v0/b/quantum-61b84.appspot.com/o/profilePictures%2F301-3012952_this-free-clipart-png-design-of-blank-avatar.png?alt=media&token=90117292-9497-4b30-980e-2b17986650cd",
        )
      });
    }
  }, [uid]);

  return (
    <img src={src} />
  );
};

export default React.memo(ProfilePhoto);