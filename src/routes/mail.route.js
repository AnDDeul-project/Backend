// mail.route.js

import express from 'express';
import { mailvoice} from '../controllers/mail.controller.js';
import { voiceUploader } from '../middleware/voice.uploader.js';

export const mailRoute = express.Router();

const setVoiceDirectory = (req, res, next) => {
    req.query.directory = 'voice';
    next();
};

// 보이스 업로드
mailRoute.post('/voice', setVoiceDirectory, voiceUploader.single('record'), mailvoice);
//mailRoute.post('/text', mailtext);