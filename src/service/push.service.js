import admin from "firebase-admin";
import dotenv from "dotenv";
import { putToken } from "../dao/push.dao.js";

dotenv.config();

export const pushAlarm = async(title, content) => {
admin.initializeApp({
    credential: admin.credential.cert(process.GOOGLE_APPLICATION_CREDENTIALS),
  });

// This registration token comes from the client FCM SDKs.
//일단 바로 넣고 테스트할 예정
const registrationToken = process.env.DEVICE_TOKEN;

const message = {
  data: {
    title: title,
    content: content,
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
}


// updateToken
export const updateToken = async (snsId, token) => {
  const result = await putToken(snsId, token);
  return result;
};
