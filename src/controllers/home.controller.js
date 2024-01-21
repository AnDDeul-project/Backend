import { homeService } from '../services/home.service.js';
import { response } from '../config/response.js';
import { status } from '../config/response.status.js'

export const createPost = async (req, res, next) => {
    try {
        const { user_idx, context } = req.body;
        const pictureUrls = req.files.map(file => file.location); // S3 URL 추출

        const post = await homeService.createPost({ user_idx, context, picture: JSON.stringify(pictureUrls) });
        res.send(response(status.SUCCESS, post));
    } catch (error) {
        next(error);
    }
}

// export const createPost = async (req, res, next) => {
//     console.log("body", req.body);
//     console.log("files", req.file);

//     res.send(response(status.SUCCESS));
// }