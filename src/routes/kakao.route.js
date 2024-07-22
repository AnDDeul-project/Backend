import express from "express";
import { signInkakao, signOutKakao, unLinkKakao, token} from "../controllers/user.controller.js";

export const kakaoRouter = express.Router();
kakaoRouter.post('/kakao/signin', signInkakao);
kakaoRouter.post('/token', token);
kakaoRouter.post('/kakao/logout', signOutKakao);
kakaoRouter.post('/kakao/unlink', unLinkKakao);