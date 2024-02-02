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
