import express from 'express';
import { putToken } from '../controllers/push.controller.js';

export const pushRoute = express.Router();

pushRoute.put('/putToken', putToken);