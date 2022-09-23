const fetch = require('node-fetch');
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
// const firebase_tools = require('firebase-tools');

const app = admin.initializeApp();

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

exports.updateNews = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
  const res1 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=Humboldt%20County&mkt=en-US', option);
  const humboldtCountyNews = await res1.json();
  const res2 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=Cal%20Poly%20Humboldt&mkt=en-US', option);
  const humboldtStateNews = await res2.json();
  const res3 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=UCLA&mkt=en-US', option);
  const uclaNews = await res3.json();
  const res4 = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=LA%20County&mkt=en-US', option);
  const laCountyNews = await res4.json();

  let uclaArticles = [];
  if (uclaNews && "value" in uclaNews && Array.isArray(uclaNews.value)) {
    let arrSize = uclaNews.value.length;
    if(arrSize > 5){
      arrSize = 5;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in uclaNews.value[i] && "thumbnail" in uclaNews.value[i].image && "contentUrl" in uclaNews.value[i].image.thumbnail) {
        temp['image'] = uclaNews.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if("name" in uclaNews.value[i])
        temp['title'] = uclaNews.value[i].name;
      if("url" in uclaNews.value[i])
        temp['url'] = uclaNews.value[i].url;
      if("datePublished" in uclaNews.value[i])
        temp['date'] = uclaNews.value[i].datePublished;
      uclaArticles.push(temp);
    }
  }

  let laCountyArticles = [];
  if (laCountyNews && "value" in laCountyNews && Array.isArray(laCountyNews.value)) {
    let arrSize = laCountyNews.value.length;
    if(arrSize > 5){
      arrSize = 5;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in laCountyNews.value[i] && "thumbnail" in laCountyNews.value[i].image && "contentUrl" in laCountyNews.value[i].image.thumbnail) {
        temp['image'] = laCountyNews.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if("name" in laCountyNews.value[i])
        temp['title'] = laCountyNews.value[i].name;
      if("url" in laCountyNews.value[i])
        temp['url'] = laCountyNews.value[i].url;
      if("datePublished" in laCountyNews.value[i])
        temp['date'] = laCountyNews.value[i].datePublished;
      laCountyArticles.push(temp);
    }
  }

  admin.firestore().collection('schoolNews').doc('UCLA').update({
    schoolArticles: uclaArticles,
    localArticles: laCountyArticles
  }).catch((err) => console.error(err));

  let articles = [];
  if (humboldtCountyNews && "value" in humboldtCountyNews && Array.isArray(humboldtCountyNews.value)) {
    let arrSize = humboldtCountyNews.value.length;
    if(arrSize > 5){
      arrSize = 5;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in humboldtCountyNews.value[i] && "thumbnail" in humboldtCountyNews.value[i].image && "contentUrl" in humboldtCountyNews.value[i].image.thumbnail) {
        temp['image'] = humboldtCountyNews.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if("name" in humboldtCountyNews.value[i])
        temp['title'] = humboldtCountyNews.value[i].name;
      if("url" in humboldtCountyNews.value[i])
        temp['url'] = humboldtCountyNews.value[i].url;
      // temp['info'] = humboldtCountyNews.value[i].description;
      if("datePublished" in humboldtCountyNews.value[i])
        temp['date'] = humboldtCountyNews.value[i].datePublished;
      articles.push(temp);
    }
  }

  let schoolArticles = [];
  if (humboldtStateNews && "value" in humboldtStateNews && Array.isArray(humboldtStateNews.value)) {
    let arrSize = humboldtStateNews.value.length;
    if(arrSize > 10){
      arrSize = 10;
    }
    for (let i = 0; i < arrSize; ++i) {
      let temp = {};
      if ("image" in humboldtStateNews.value[i] && "thumbnail" in humboldtStateNews.value[i].image && "contentUrl" in humboldtStateNews.value[i].image.thumbnail) {
        temp['image'] = humboldtStateNews.value[i].image.thumbnail.contentUrl;
      } else {
        temp['image'] = '';
      }
      if("name" in humboldtStateNews.value[i])
        temp['title'] = humboldtStateNews.value[i].name;
      if("url" in humboldtStateNews.value[i])
        temp['url'] = humboldtStateNews.value[i].url;
      // temp['info'] = humboldtCountyNews.value[i].description;
      if("datePublished" in humboldtStateNews.value[i])
        temp['date'] = humboldtStateNews.value[i].datePublished;
      schoolArticles.push(temp);
    }
  }

  admin.firestore().collection('schoolNews').doc('CalPolyHumboldt').update({
    schoolArticles: schoolArticles,
    localArticles: articles
  }).catch((err) => console.error(err));

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

// exports.sendCommentsNotification = functions.https.onCall((data, context) => {
//   if(!context.auth){
//     throw new functions.https.HttpsError(
//       'unauthenticated',
//       'Something went wrong, try logging in again'
//     );
//   }
//   if(!data.key){ // key is userUid that notif will be sent to
//     throw new functions.https.HttpsError(
//       'resource-exhausted',
//       'Invalid data, try again'
//     );
//   }

//   const key = data.key.toString();
//   // send notification
// });