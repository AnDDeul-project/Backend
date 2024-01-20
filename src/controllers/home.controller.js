// import { homeService } from '../services/home.service.js';
import { response } from '../config/response.js';
import { status } from '../config/response.status.js'

export const createPost = async (req, res, next) => {
    console.log("body", req.body);
    console.log("files", req.file);

    res.send(response(status.SUCCESS));
}