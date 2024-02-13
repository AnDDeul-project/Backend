//check.route.js

import express from 'express';
import { addCheck, getCheck, contentCheck, dateCheck, completeCheck, deleteCheck, imgCheck} from '../controllers/check.controller.js'
import { imageUploader } from "../middleware/image.uploader.js";

export const checkRoute = express.Router();

// directory 값 고정
const setCheckDirectory = (req, res, next) => {
    req.query.directory = 'check';
    next();
};

// 체크리스트 추가 post
checkRoute.post('/add', addCheck);

// 1인 체크리스트 날짜별로 불러오기 get
checkRoute.get('/:userid/:mode/:date', getCheck);

// 체크리스트 내용 수정 put
checkRoute.put('/:checkid/content', contentCheck);

// 체크리스트 기한 변경 put
checkRoute.put('/:checkid/date/:date', dateCheck);

// 체크리스트 완료 여부 변경 put
checkRoute.put('/:checkid/complete', completeCheck);

// 체크리스트 삭제 delete
checkRoute.delete('/:checkid', deleteCheck);

// 체크리스트 인증샷 추가 patch
checkRoute.patch('/img', setCheckDirectory, imageUploader.single('image'), imgCheck);