import express from "express";
import { createPost, getPosts, updatePost, deletePost, getFamilyMembers, addEmojiToPost, getUserProfile, getSinglePost, updateUserProfile, approveFamilyMember } from '../controllers/home.controller.js';
import { imageUploader } from "../middleware/image.uploader.js";

export const homeRoute = express.Router();

// directory 값을 board로 고정하는 미들웨어
const setBoardDirectory = (req, res, next) => {
    req.query.directory = 'board'; // req 객체에 directory 값을 고정
    next(); // 다음 미들웨어로 이동
};

const setProfileDirectory = (req, res, next) => {
    req.query.directory = 'profile'; // req 객체에 directory 값을 설정
    next(); // 다음 미들웨어로 이동
};

// 게시글 작성(Post)
homeRoute.post('/board', setBoardDirectory, imageUploader.array('image', 10), createPost);

// 가족 게시글 전체 조회
homeRoute.get('/posts', getPosts);

// 게시글 수정
homeRoute.patch('/posts/:postIdx', updatePost);

// 게시글 삭제
homeRoute.delete('/posts/:postIdx', deletePost);

// 가족 구성원 조회
homeRoute.get('/family/members', getFamilyMembers);

// 게시글에 감정 표현 추가
homeRoute.post('/posts/:postIdx/emoji', addEmojiToPost);

// 특정 유저 프로필 페이지 조회
homeRoute.get('/user/:userId/profile', getUserProfile);

// 특정 게시글 1개 조회
homeRoute.get('/posts/:postIdx', getSinglePost);

// 유저 프로필 정보 수정(Put)
homeRoute.patch('/user/profile', setProfileDirectory, imageUploader.single('image'), updateUserProfile);

// 가족 승인
homeRoute.put('/family/:userId', approveFamilyMember); 
