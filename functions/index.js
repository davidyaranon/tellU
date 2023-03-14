const fetch = require("node-fetch");
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: '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'
});
const openai = new OpenAIApi(configuration);

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://quantum-61b84-default-rtdb.firebaseio.com",
  storageBucket: "quantum-61b84.appspot.com"
});

process.env.DEBUG = true;


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: "app.tellu@gmail.com",
    pass: "ryphaisxcgpcsvau"
  }
});

const apiKey = '8b14944f22e147c8a9f16104c71461e9';
const option = {
  mode: "cors",
  headers: {
    "Ocp-Apim-Subscription-Key": apiKey
  }
};

exports.updateNews = functions.pubsub.schedule('every 240 minutes').onRun(async (context) => {
  const res1 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=Humboldt%20County%20CA&mkt=en-US', option);
  const humboldtCountyNews = await res1.json();
  const res2 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=Cal%20Poly%20Humboldt&mkt=en-US', option);
  const humboldtStateNews = await res2.json();
  const res3 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=Lost%20Coast%20Outpost%20Humboldt&mkt=en-US', option);
  const lostCoastOutpost = await res3.json();
  const res4 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=Humboldt%20Ca&mkt=en-US', option);
  const elLenador = await res4.json();

  const berk = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=UC%20Berkeley&mkt=en-US', option);
  const berkNews = await berk.json();

  let berkArticles = [];

  let articles = [];

  if (berkNews && "value" in berkNews && Array.isArray(berkNews.value)) {
    let arrSize = berkNews.value.length;
    if (arrSize > 15) {
      arrSize = 15;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in berkNews.value[i] && "thumbnail" in berkNews.value[i].image && "contentUrl" in berkNews.value[i].image.thumbnail) {
        temp['image'] = berkNews.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if ("name" in berkNews.value[i])
        temp['title'] = berkNews.value[i].name;
      if ("url" in berkNews.value[i])
        temp['url'] = berkNews.value[i].url;
      if ("datePublished" in berkNews.value[i])
        temp['date'] = berkNews.value[i].datePublished;
      berkArticles.push(temp);
    }
  } else {
    console.log("berk articles if check failed");
  }

  if (humboldtCountyNews && "value" in humboldtCountyNews && Array.isArray(humboldtCountyNews.value)) {
    let arrSize = humboldtCountyNews.value.length;
    if (arrSize > 5) {
      arrSize = 5;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in humboldtCountyNews.value[i] && "thumbnail" in humboldtCountyNews.value[i].image && "contentUrl" in humboldtCountyNews.value[i].image.thumbnail) {
        temp['image'] = humboldtCountyNews.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if ("name" in humboldtCountyNews.value[i])
        temp['title'] = humboldtCountyNews.value[i].name;
      if ("url" in humboldtCountyNews.value[i])
        temp['url'] = humboldtCountyNews.value[i].url;
      if ("datePublished" in humboldtCountyNews.value[i])
        temp['date'] = humboldtCountyNews.value[i].datePublished;
      articles.push(temp);
    }
  } else {
    console.log("county articles if check failed");
  }

  if (lostCoastOutpost && "value" in lostCoastOutpost && Array.isArray(lostCoastOutpost.value)) {
    let arrSize = lostCoastOutpost.value.length;
    if (arrSize > 5) {
      arrSize = 5;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in lostCoastOutpost.value[i] && "thumbnail" in lostCoastOutpost.value[i].image && "contentUrl" in lostCoastOutpost.value[i].image.thumbnail) {
        temp['image'] = lostCoastOutpost.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = 'https://lostcoastoutpost.com/favicon.ico';
      }
      if ("name" in lostCoastOutpost.value[i])
        temp['title'] = lostCoastOutpost.value[i].name;
      if ("url" in lostCoastOutpost.value[i])
        temp['url'] = lostCoastOutpost.value[i].url;
      if ("datePublished" in lostCoastOutpost.value[i])
        temp['date'] = lostCoastOutpost.value[i].datePublished;
      articles.push(temp);
    }
  } else {
    console.log("lostCoastOutpost articles if check failed");
  }

  if (elLenador && "value" in elLenador && Array.isArray(elLenador.value)) {
    let arrSize = elLenador.value.length;
    if (arrSize > 5) {
      arrSize = 5;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in elLenador.value[i] && "thumbnail" in elLenador.value[i].image && "contentUrl" in elLenador.value[i].image.thumbnail) {
        temp['image'] = elLenador.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if ("name" in elLenador.value[i])
        temp['title'] = elLenador.value[i].name;
      if ("url" in elLenador.value[i])
        temp['url'] = elLenador.value[i].url;
      if ("datePublished" in elLenador.value[i])
        temp['date'] = elLenador.value[i].datePublished;
      articles.push(temp);
    }
  } else {
    console.log("EL Lenador articles if check failed");
  }

  let schoolArticles = [];
  if (humboldtStateNews && "value" in humboldtStateNews && Array.isArray(humboldtStateNews.value)) {
    let arrSize = humboldtStateNews.value.length;
    if (arrSize > 10) {
      arrSize = 10;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in humboldtStateNews.value[i] && "thumbnail" in humboldtStateNews.value[i].image && "contentUrl" in humboldtStateNews.value[i].image.thumbnail) {
        temp['image'] = humboldtStateNews.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if ("name" in humboldtStateNews.value[i])
        temp['title'] = humboldtStateNews.value[i].name;
      if ("url" in humboldtStateNews.value[i])
        temp['url'] = humboldtStateNews.value[i].url;
      if ("datePublished" in humboldtStateNews.value[i])
        temp['date'] = humboldtStateNews.value[i].datePublished;
      schoolArticles.push(temp);
    }
    console.log(schoolArticles);
  } else {
    console.log("school articles if check failed");
  }

  if (berkArticles.length > 0) {
    admin.firestore().collection('schoolNews').doc('UCBerkeley').update({
      schoolArticles: berkArticles
    }).catch((err) => console.log(err));
  }

  if (!schoolArticles || !articles || schoolArticles.length <= 0 || articles.length <= 0) {
    console.log("articles empty");
  } else {
    admin.firestore().collection('schoolNews').doc('CalPolyHumboldt').update({
      schoolArticles: schoolArticles,
      localArticles: articles
    }).catch((err) => console.log(err));
  }
});

exports.getHumboldtUpdates = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }

  const bucket = app.storage().bucket();
  const file = bucket.file('HSU-featured-events.rss');
  const contents = await file.download();
  return contents.toString();
});

exports.deleteImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }
  if (!data.path) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Invalid data, try again'
    );
  }
  const path = data.path.toString();
  const bucket = app.storage().bucket();
  try {
    await bucket.file(path).delete();
  } catch (error) {
    console.log(error);
  }
});

exports.deleteLikesDocFromRtdb = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }
  if (!data.key) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Invalid data, try again'
    );
  }
  const key = data.key.toString();
  const dbRef = app.database().ref(`/${key}`);
  dbRef.remove().then(() => {
  }).catch((err) => {
    console.log(err);
  })
});

exports.deleteCommentsFromDeletedPost = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }
  if (!data.key || !data.schoolName) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Invalid data, try again'
    );
  }
  const key = data.key.toString();
  const schoolName = data.schoolName.toString();
  admin.firestore().collection('schoolPosts').doc(schoolName).collection('allPosts').doc(key).collection('comments').get().then(querySnapshot => {
    querySnapshot.docs.forEach(snpashot => {
      snpashot.ref.delete();
    });
  });
});

exports.sendEmailOnReport = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }
  if (!data.key || !data.schoolName || !data.message || !data.reporterUid || !data.reporterEmail) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Invalid data, try again'
    );
  }
  const mailOptions = {
    from: `app.tellU@gmail.com`,
    to: `app.tellU@gmail.com, ${data.reporterEmail}`,
    subject: 'You reported a tellU Post',
    html: `<h1>Report Info</h1>
     <p> <b>School: </b>${data.schoolName} </p>
     <p> <b>Reason: </b>${data.message} </p>
     <p> <b>Post Key: </b>${data.key} </p>
     <p> <b>Reporter UID: </b>${data.reporterUid} </p>`
  };
  return transporter.sendMail(mailOptions, (error, data) => {
    if (error) {
      console.log(error)
      return
    }
    console.log("Sent!")
  });
});

exports.sendDmNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }
  if (!data.userName || !data.notificationsToken || !data.message || !data.data.url || !data.icon || !data.posterUid) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Invalid data, try again'
    );
  }

  const body = {
    notification: {
      title: 'tellU',
      body: data.userName + ' sent a DM: ' + data.message,
      sound: 'default',
      data: {
        url: data.data.url
      },
      click_action: 'FCM_PLUGIN_ACTIVITY'
    },
    to: data.notificationsToken
  }
  const document = await app.firestore().collection("userData").doc(data.posterUid).get();
  if (document && document.data()) {
    let arr = document.data().notifs;
    let newNotifs = [];
    let count = 0;
    if (arr.length > 0) {
      for (let i = arr.length - 1; i >= 0; --i) {
        newNotifs.push(arr[i]);
        count++;
        if (count >= 30) { break; }
      }
    }
    const created_at = admin.firestore.Timestamp.now()
    newNotifs.push({
      userName: data.userName,
      message: data.message,
      chatroomString: data.data.url,
      posterUid: data.posterUid,
      date: created_at
    });
    app.firestore().collection("userData").doc(data.posterUid).update({
      notifs: newNotifs
    });
  }
  await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': 'key=AAAAa1skHNM:APA91bFyQscFwRAN4en0Jkt5IYZ4iwUQC6DhOIPCKNeoQJ7rO5BAEUlH1iB0da18o1Jq0gqfx19e_UrBvSyCTRzY1jjKnPXvAAi5KDYKJFd-e2QsioP4E_uC5XY6flVUnfX0JYhTiEy6',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).catch((err) => {
    console.log('something went wrong when sending notifs');
    console.log(err);
  });

});

exports.askAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    functions.logger.log("no auth");
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }
  if (!data.message) {
    functions.logger.log("invalid data");
    console.log("invalid data");
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Invalid data, try again'
    );
  }

  const message = data.message.toString();

  functions.logger.log("message: " + message);

  let msgs = [
    { role: 'system', content: 'You are Humboldt Hank, a lumberjack and the brother of the mascot of Cal Poly Humboldt. You work as a chat assistant on a mobile app for university students called tellU. Respond with witty banter that reflects your personality.' },
    { role: 'user', content: message },
    { role: 'assistant', content: 'Chat response here...' }
  ];

  try {
    const chatGPT = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: msgs
    });
    return chatGPT.data.choices[0].message;
  } catch (err) {
    console.log('error in openai');
    if (err.response) {
      console.log(err.response.status);
      console.log(err.response.data);
      functions.logger.log(err.response.status);
      functions.logger.log(err.response.data);
    } else {
      console.log(err.message);
      functions.logger.log(err.message);
    }
    return '';
  }
  return '';
});


exports.sendCommentsNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    functions.logger.log("no context");
    console.log("No context");
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Something went wrong, try logging in again'
    );
  }
  if (!data.userName || !data.comment || !data.data.url || !data.icon || !data.posterUid || !data.postKey || !("isNotSameUser" in data)) {
    functions.logger.log("invalid data");
    console.log("invalid data");
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Invalid data, try again'
    );
  }

  functions.logger.log(data.notificationsToken);
  functions.logger.log(data.userName);
  console.log(data.userName);

  if ("taggedUsers" in data && data.taggedUsers.length > 0) {
    for (let i = 0; i < data.taggedUsers.length; ++i) {
      const taggedUser = data.taggedUsers[i];
      const userDoc = await app.firestore().collection("userData").where("userName", "==", taggedUser).get();
      functions.logger.log(taggedUser);
      functions.logger.log(userDoc);
      for (let j = 0; j < userDoc.docs.length; ++j) {
        let commenterNotifToken = userDoc.docs[j].data().notificationsToken;
        const notifBody = {
          notification: {
            title: 'tellU',
            body: data.userName + ' tagged you in a reply',
            sound: 'default',
            data: {
              url: data.data.url
            },
            click_action: 'FCM_PLUGIN_ACTIVITY'
          },
          to: commenterNotifToken
        }
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': 'key=AAAAa1skHNM:APA91bFyQscFwRAN4en0Jkt5IYZ4iwUQC6DhOIPCKNeoQJ7rO5BAEUlH1iB0da18o1Jq0gqfx19e_UrBvSyCTRzY1jjKnPXvAAi5KDYKJFd-e2QsioP4E_uC5XY6flVUnfX0JYhTiEy6',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notifBody)
        }).then(() => {
          functions.logger.log("sent tagged notif to: ", commenterNotifToken, taggedUser);
        }).catch((err) => {
          console.log('something went wrong when sending tagged notifs');
          console.log(err);
        });
      }
    }
  } else {
    functions.logger.log("no tagged users");
  }

  if (data.isNotSameUser) {
    const body = {
      notification: {
        title: 'tellU',
        body: data.userName + ' commented: ' + data.comment,
        sound: 'default',
        data: {
          url: data.data.url
        },
        click_action: 'FCM_PLUGIN_ACTIVITY'
      },
      to: data.notificationsToken
    }
    const document = await app.firestore().collection("userData").doc(data.posterUid).get();
    if (document && document.data()) {
      let arr = document.data().notifs;
      let newNotifs = [];
      let count = 0;
      if (arr.length > 0) {
        for (let i = arr.length - 1; i >= 0; --i) {
          newNotifs.push(arr[i]);
          count++;
          if (count >= 30) { break; }
        }
      }
      const created_at = admin.firestore.Timestamp.now()
      newNotifs.push({
        userName: data.userName,
        comment: data.comment,
        postKey: data.postKey,
        posterUid: data.posterUid,
        date: created_at
      });
      app.firestore().collection("userData").doc(data.posterUid).update({
        notifs: newNotifs
      });
    }
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': 'key=AAAAa1skHNM:APA91bFyQscFwRAN4en0Jkt5IYZ4iwUQC6DhOIPCKNeoQJ7rO5BAEUlH1iB0da18o1Jq0gqfx19e_UrBvSyCTRzY1jjKnPXvAAi5KDYKJFd-e2QsioP4E_uC5XY6flVUnfX0JYhTiEy6',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(() => {
      functions.logger.log("sent notif to: ", data.notificationsToken);
    }).catch((err) => {
      console.log('something went wrong when sending notifs');
      console.log(err);
    });
  }
});

