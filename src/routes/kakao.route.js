import express from "express";
import { signInkakao } from "../controllers/user.controller.js";

export const kakaoRouter = express.Router();
kakaoRouter.post('/kakao/signin', signInkakao);