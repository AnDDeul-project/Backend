import { homeService } from '../services/home.service.js';
import { response } from '../config/response.js';
import { status } from '../config/response.status.js';
import { verify } from '../service/auth.js'

// 게시글 생성
export const createPost = async (req, res, next) => {
    try {
        const snsId = await verify(req, res);
        const { content } = req.body; // user_idx 파라미터 제거
        let pictureUrls = [];
        if (req.files) {
            pictureUrls = req.files.map(file => file.location); // S3 URL 추출
        }
        // snsId를 user_idx로 사용하여 게시글 생성
        const post = await homeService.createPost({ user_idx: snsId, content, picture: JSON.stringify(pictureUrls) });
        res.send(response(status.SUCCESS));
    } catch (error) {
        next(error);
    }
};

// 게시글 조회 (수정됨)
export const getPosts = async (req, res, next) => {
    try {
        const snsId = await verify(req, res); // 또는 req.user.snsId (미들웨어를 통해 설정된 경우)
        const posts = await homeService.getPosts(snsId);
        res.send(response(status.SUCCESS, posts));
    } catch (error) {
        next(error);
    }
};

// 게시글 수정
export const updatePost = async (req, res, next) => {
    try {
        const snsId = await verify(req, res); // 로그인한 사용자의 snsId
        const postIdx = req.params.postIdx; // URL에서 게시글 번호 추출
        const { content } = req.body; // 수정할 게시글 내용
        console.log(`Extracted content from request body:`, content);

        await homeService.updatePost(snsId, postIdx, content);
        res.send(response(status.SUCCESS, "게시글이 수정되었습니다."));
    } catch (error) {
        next(error);
    }
};


// 게시글 삭제
export const deletePost = async (req, res, next) => {
    try {
        const snsId = await verify(req, res); // 로그인한 사용자의 snsId
        const postIdx = req.params.postIdx; // URL에서 게시글 번호(postIdx) 추출
        console.log("postIdx from controller:", postIdx); // 게시글 번호(postIdx) 로깅

        await homeService.deletePost(snsId, postIdx);
        res.send(response(status.SUCCESS, "게시글이 삭제되었습니다."));
    } catch (error) {
        next(error);
    }
};


// 가족 구성원 조회
export const getFamilyMembers = async (req, res, next) => {
    try {
        const snsId = await verify(req, res); // 또는 req.user.snsId (미들웨어를 통해 설정된 경우)
        const members = await homeService.getFamilyMembers(snsId);
        res.send(response(status.SUCCESS, members));
    } catch (error) {
        next(error);
    }
};

// 게시글 이모지 생성
export const addEmojiToPost = async (req, res, next) => {
    try {
        const snsId = await verify(req, res);
        const postIdx = req.params.postIdx;
        const { emojiType } = req.body; // emojiType: 'happy_emj', 'laugh_emj', 'sad_emj'
        await homeService.addEmoji(postIdx, snsId, emojiType);
        res.send(response(status.SUCCESS, "이모지 생성이 완료되었습니다."));
    } catch (error) {
        next(error);
    }
};

// 유저 프로필 조회
export const getUserProfile = async (req, res, next) => {
    try {
        const snsId = await verify(req, res);
        const userProfile = await homeService.getUserProfile(snsId);
        res.send(response(status.SUCCESS, userProfile));
    } catch (error) {
        next(error);
    }
};