const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

process.env.DEBUG = true
const firebase_tools = require('firebase-tools')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.addNewDoc = functions.https.onCall(async (data) => {
  // Grab the text parameter.
  const original = data.docName;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages').add({original: original});
  // Send back a message that we've successfully written the message
  // res.json({result: `Message with ID: ${writeResult.id} added.`});
  functions.logger.log(original);
  functions.logger.log(writeResult.id);
});

exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
    .onCreate((snap, context) => {
      // Grab the current value of what was written to Firestore.
      const original = snap.data().original;

      // Access the parameter `{documentId}` with `context.params`
      functions.logger.log('Uppercasing', context.params.documentId, original);
      
      const uppercase = original.toUpperCase();
      
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to Firestore.
      // Setting an 'uppercase' field in Firestore document returns a Promise.
      return snap.ref.set({uppercase}, {merge: true});
    });

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages').add({original: original});
  // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

// /schoolPosts/UCBerkeley/allPosts/post1/comments
exports.recursiveDelete = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall(async (data) => {
    // Only allow admin users to execute this function.
    // if (!(context.auth && context.auth.token && context.auth.token.admin)) {
    //   throw new functions.https.HttpsError(
    //     'permission-denied',
    //     'Must be an administrative user to initiate delete.'
    //   );
    // }

    const path = data.path;
    functions.logger.log("path \n");
    functions.logger.log(path);
    functions.logger.log(process.env.GCLOUD_PROJECT);
    functions.logger.log(functions.config().fb.token);
    // console.log(
    //   `User ${context.auth.uid} has requested to delete path ${path}`
    // );

    // Run a recursive delete on the given document or collection path.
    // The 'token' must be set in the functions config, and can be generated
    // at the command line by running 'firebase login:ci'.
    await firebase_tools.firestore
      .delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token,
        force: true
      });
      //1//06FPQgofYuq6dCgYIARAAGAYSNwF-L9IrMVNpH5tMLLi44ISo3jJrnnoAzcRMWcFWbUlV63Ev2NgN3kKo3ZfWuwqDVvQTb_nc4Co
      functions.logger.log("Deleted " , path);
      console.log("deleted");
    return {
      path: path 
    };
  });