import express from "express";
import { createPost, getPosts } from '../controllers/home.controller.js';
import { imageUploader } from "../middleware/image.uploader.js";

export const homeRoute = express.Router();

// 게시글 작성(Post)
homeRoute.post('/board', imageUploader.array('image', 10), createPost);

// 게시글 목록 조회 (GET)
homeRoute.get('/posts', getPosts);