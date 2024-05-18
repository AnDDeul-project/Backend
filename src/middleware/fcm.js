import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
    credential: admin.credential.cert(process.GOOGLE_APPLICATION_CREDENTIALS),
  });



// This registration token comes from the client FCM SDKs.
const registrationToken = 'YOUR_REGISTRATION_TOKEN';

const message = {
  data: {
    title: '안뜰',
    content: '읽지 않은 알림이 있습니다 !'
  },
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
getMessaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });