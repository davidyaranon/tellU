const fetch = require('node-fetch');
const functions = require("firebase-functions");
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');

admin.initializeApp();

process.env.DEBUG = true;

const humboldt = ['40.875130691835615', '-124.07857275064532'];
const berkeley = ['37.87196553251828', '-122.25832234237413'];
const davis = ['38.53906813693881', '-121.7519863294826'];
const irvine = ['33.642798513829284', '-117.83657521816043'];
const ucla = ['34.068060230062784', '-118.4450963024167'];
const merced = ['37.362385', '-120.427911'];
const riverside = ['33.972975051337265', '-117.32790083366463'];
const sanDiego = ['32.8791284369769', '-117.2368054903461'];
const sf = ['37.76894651194302', '-122.42952641954717'];
const sb = ['34.41302723872466', '-119.84749752183016'];
const sc = ['36.994178678923895', '-122.05892788857311'];

exports.updateWeather = functions.pubsub.schedule('every 30 minutes').onRun((context) => {
  const fetchFromURLhumboldt = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + humboldt[0] + ',' + humboldt[1] + '&aqi=yes')).json();
  const fetchFromURLberkeley = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + berkeley[0] + ',' + berkeley[1] + '&aqi=yes')).json();
  const fetchFromURLmerced = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + merced[0] + ',' + merced[1] + '&aqi=yes')).json();
  const fetchFromURLdavis = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + davis[0] + ',' + davis[1] + '&aqi=yes')).json();
  const fetchFromURLirvine = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + irvine[0] + ',' + irvine[1] + '&aqi=yes')).json();
  const fetchFromURLucla = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + ucla[0] + ',' + ucla[1] + '&aqi=yes')).json();
  const fetchFromURLriverside = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + riverside[0] + ',' + riverside[1] + '&aqi=yes')).json();
  const fetchFromURLsanDiego = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + sanDiego[0] + ',' + sanDiego[1] + '&aqi=yes')).json();
  const fetchFromURLsf = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + sf[0] + ',' + sf[1] + '&aqi=yes')).json();
  const fetchFromURLsb = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + sb[0] + ',' + sb[1] + '&aqi=yes')).json();
  const fetchFromURLsc = async () => await (await fetch('http://api.weatherapi.com/v1/current.json?key=4069e69e172d41149ac65458221905&q=' + sc[0] + ',' + sc[1] + '&aqi=yes')).json();

  fetchFromURLhumboldt().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('CalPolyHumboldt').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: weatherData.location,
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLberkeley().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCBerkeley').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: 'Berkeley',
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLmerced().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCMerced').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: 'Merced',
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLdavis().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCDavis').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: 'Davis'
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLirvine().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCIrvine').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: 'Irvine',
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLucla().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCLA').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: weatherData.location,
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLriverside().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCRiverside').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: 'Riverside',
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLsanDiego().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCSanDiego').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: 'San Diego'
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLsf().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: data.location.name,
    };
    admin.firestore().collection('schoolWeather').doc('UCSF').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: weatherData.location,
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLsb().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: 'Santa Barbara',
    };
    admin.firestore().collection('schoolWeather').doc('UCSantaBarbara').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: weatherData.location,
    });
  }).catch((err) => {
    console.log(err);
  });

  fetchFromURLsc().then((data) => {
    const weatherData = {
      epaIndex: data.current.air_quality["us-epa-index"],
      icon: data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64', ''),
      text: data.current.condition.text,
      feelsLike: data.current.feelslike_f,
      temp: data.current.temp_f,
      humidity: data.current.humidity,
      location: 'Santa Cruz'
    };
    admin.firestore().collection('schoolWeather').doc('UCSantaCruz').update({
      feelsLike : weatherData.feelsLike,
      humidity : weatherData.humidity,
      icon : weatherData.icon,
      index : weatherData.epaIndex,
      temp : weatherData.temp,
      text : weatherData.text,
      location: weatherData.location,
    });
  }).catch((err) => {
    console.log(err);
  });
  
});

// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// exports.addNewDoc = functions.https.onCall(async (data) => {
//   // Grab the text parameter.
//   const original = data.docName;
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await admin.firestore().collection('messages').add({original: original});
//   // Send back a message that we've successfully written the message
//   // res.json({result: `Message with ID: ${writeResult.id} added.`});
//   functions.logger.log(original);
//   functions.logger.log(writeResult.id);
// });

// exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
//     .onCreate((snap, context) => {
//       // Grab the current value of what was written to Firestore.
//       const original = snap.data().original;

//       // Access the parameter `{documentId}` with `context.params`
//       functions.logger.log('Uppercasing', context.params.documentId, original);
      
//       const uppercase = original.toUpperCase();
      
//       // You must return a Promise when performing asynchronous tasks inside a Functions such as
//       // writing to Firestore.
//       // Setting an 'uppercase' field in Firestore document returns a Promise.
//       return snap.ref.set({uppercase}, {merge: true});
//     });

// // Take the text parameter passed to this HTTP endpoint and insert it into 
// // Firestore under the path /messages/:documentId/original
// exports.addMessage = functions.https.onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await admin.firestore().collection('messages').add({original: original});
//   // Send back a message that we've successfully written the message
//   res.json({result: `Message with ID: ${writeResult.id} added.`});
// });

// // /schoolPosts/UCBerkeley/allPosts/post1/comments
// exports.recursiveDelete = functions
//   .runWith({
//     timeoutSeconds: 540,
//     memory: '2GB'
//   })
//   .https.onCall(async (data) => {
//     // Only allow admin users to execute this function.
//     // if (!(context.auth && context.auth.token && context.auth.token.admin)) {
//     //   throw new functions.https.HttpsError(
//     //     'permission-denied',
//     //     'Must be an administrative user to initiate delete.'
//     //   );
//     // }

//     const path = data.path;
//     functions.logger.log("path \n");
//     functions.logger.log(path);
//     functions.logger.log(process.env.GCLOUD_PROJECT);
//     functions.logger.log(functions.config().fb.token);
//     // console.log(
//     //   `User ${context.auth.uid} has requested to delete path ${path}`
//     // );

//     // Run a recursive delete on the given document or collection path.
//     // The 'token' must be set in the functions config, and can be generated
//     // at the command line by running 'firebase login:ci'.
//     await firebase_tools.firestore
//       .delete(path, {
//         project: process.env.GCLOUD_PROJECT,
//         recursive: true,
//         yes: true,
//         token: functions.config().fb.token,
//         force: true
//       });
//       //1//06FPQgofYuq6dCgYIARAAGAYSNwF-L9IrMVNpH5tMLLi44ISo3jJrnnoAzcRMWcFWbUlV63Ev2NgN3kKo3ZfWuwqDVvQTb_nc4Co
//       functions.logger.log("Deleted " , path);
//       console.log("deleted");
//     return {
//       path: path 
//     };
//   });