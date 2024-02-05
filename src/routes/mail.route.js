// mail.route.js

import express from 'express';
import { mailvoice, mailtext } from '../controllers/mail.controller.js';
import { voiceUploader } from '../middleware/voice.uploader.js';

export const mailRoute = express.Router();

const setVoiceDirectory = (req, res, next) => {
    req.query.directory = 'voice';
    next();
};

// 보이스 업로드
mailRoute.post('/voice', setVoiceDirectory, voiceUploader.single('record'), mailvoice);

// 텍스트 업로드
mailRoute.post('/text', mailtext);