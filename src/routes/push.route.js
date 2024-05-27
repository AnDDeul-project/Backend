import express from 'express';
import { makeAlarm, putToken } from '../controllers/push.controller.js';

export const pushRoute = express.Router();

pushRoute.put('/putToken', putToken);