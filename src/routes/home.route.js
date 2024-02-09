import express from "express";
import { createPost, getPosts, updatePost, deletePost, getFamilyMembers, addEmojiToPost, getUserProfile, getSinglePost } from '../controllers/home.controller.js';
import { imageUploader } from "../middleware/image.uploader.js";

export const homeRoute = express.Router();

// directory 값을 board로 고정하는 미들웨어
const setBoardDirectory = (req, res, next) => {
    req.query.directory = 'board'; // req 객체에 directory 값을 고정
    next(); // 다음 미들웨어로 이동
};

// 게시글 작성(Post)
homeRoute.post('/board', setBoardDirectory, imageUploader.array('image', 10), createPost);

// 게시글 목록 조회 (GET)
homeRoute.get('/posts', getPosts);

// 게시글 수정
homeRoute.patch('/posts/:postIdx', updatePost);

// 게시글 삭제
homeRoute.delete('/posts/:postIdx', deletePost);

// 가족 구성원 조회
homeRoute.get('/family/members', getFamilyMembers);

// 게시글에 감정 표현 추가
homeRoute.post('/posts/:postIdx/emoji', addEmojiToPost);

// 유저 프로필 페이지 조회
homeRoute.get('/user/:userId/profile', getUserProfile);

// 특정 게시글 1개 조회
homeRoute.get('/posts/:postIdx', getSinglePost);
