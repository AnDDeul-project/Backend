import express from "express";
import { signInkakao, signOutKakao } from "../controllers/user.controller.js";

export const kakaoRouter = express.Router();
kakaoRouter.post('/kakao/signin', signInkakao);
kakaoRouter.post('/kakao/logout', signOutKakao);