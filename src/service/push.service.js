import admin from "firebase-admin";
import dotenv from "dotenv";  
import { putToken } from "../dao/push.dao.js";

dotenv.config();

const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentials = JSON.parse(Buffer.from(base64Credentials, 'base64').toString('utf-8'));

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

export const pushAlarm = async(content, deviceToken) => {

//일단 바로 넣고 테스트할 예정
const registrationToken = deviceToken;

const message = {
  data: {
    title: "안뜰",
    content: content,
  },
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(message)
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
