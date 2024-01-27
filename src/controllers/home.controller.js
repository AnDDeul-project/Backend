import { homeService } from '../services/home.service.js';
import { response } from '../config/response.js';
import { status } from '../config/response.status.js'

// 게시글 생성
export const createPost = async (req, res, next) => {
    try {
        const { user_idx, content } = req.body;
        let pictureUrls = [];
        if (req.files) {
            pictureUrls = req.files.map(file => file.location); // S3 URL 추출
        }

        const post = await homeService.createPost({ user_idx, content, picture: JSON.stringify(pictureUrls) });
        res.send(response(status.SUCCESS));
    } catch (error) {
        next(error);
    }
}

// 게시글 조회
export const getPosts = async (req, res, next) => {
    try {
        const posts = await homeService.getPosts();
        res.send(response(status.SUCCESS, posts));
    } catch (error) {
        next(error);
    }
};

