import express from 'express';
import { makeAlarm } from '../controllers/push.controller.js';

export const pushRoute = express.Router();

pushRoute.get('/', makeAlarm);