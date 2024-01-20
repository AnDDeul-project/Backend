import express from "express";
import { createPost } from '../controllers/home.controller.js';
import { imageUploader } from "../middleware/image.uploader.js";

export const homeRoute = express.Router();

// 게시글 작성(Post)
homeRoute.post('/board', imageUploader.single('image'), createPost);
    // try{
    //     // 이미지 업로드 로직 수행(s3 업로드)
    //     const imageUrl = req.file? req.file.location: null;

    //     // 이후에 homeController.uploadPost 호출
    //     await homeController.uploadPost(req, res, imageUrl);
    // } catch(error) {
    //     next(error);
    // }
