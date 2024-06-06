import admin from "firebase-admin";
import dotenv from "dotenv";  
import { putToken } from "../dao/push.dao.js";

dotenv.config();

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
});

export const pushAlarm = async(content) => {

//일단 바로 넣고 테스트할 예정
const registrationToken = process.env.DEVICE_TOKEN;

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
