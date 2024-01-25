import express from "express";
import { signInkakao, signOutKakao } from "../controllers/user.controller.js";

export const kakaoRouter = express.Router();
kakaoRouter.post('/kakao/signin', signInkakao);
/**
 * @swagger
 * /api/example:
 *   get:
 *     description: Example endpoint
 *     responses:
 *       200:
 *         description: Successful response
 */
kakaoRouter.post('/kakao/logout', signOutKakao);