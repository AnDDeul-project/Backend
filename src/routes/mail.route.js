// mail.route.js

import express from 'express';
import { mailvoice, mailtext, getAll, getOne, getQuestion } from '../controllers/mail.controller.js';
import { voiceUploader } from '../middleware/voice.uploader.js';

export const mailRoute = express.Router();

const setVoiceDirectory = (req, res, next) => {
    req.query.directory = 'voice';
    next();
};

// 보이스 업로드
mailRoute.post('/voice', setVoiceDirectory, voiceUploader.single('record'), mailvoice);
mailRoute.get('/all/:today', getAll);
mailRoute.get('/one/:idx', getOne);
// 텍스트 업로드
mailRoute.post('/text', mailtext);

//오늘의 질문 불러오기
mailRoute.get('/question', getQuestion);