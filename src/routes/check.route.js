// check.route.js

import express from 'express';
import { checkadd, checkget, checkcontent, checkdate, checkcomplete, checkdelete, checkimg } from '../controllers/check.controller.js';
import { imageUploader } from '../middleware/image.uploader.js';

export const checkRoute = express.Router();

const setCheckDirectory = (req, res, next) => {
    req.query.directory = 'check';
    next();
};

// 리스트 추가
checkRoute.post('/add', checkadd);

// 리스트 불러오기
checkRoute.get('/:userid/:mode/:date', checkget);

// 할 일 수정
checkRoute.put('/:checkid/content', checkcontent);

// 기한 수정
checkRoute.put('/:checkid/date/:date', checkdate);

// 할 일 완료 혹은 완료 취소
checkRoute.put('/:checkid/complete', checkcomplete);

// 할 일 삭제
checkRoute.delete('/:checkid', checkdelete);

// 사진 넣기
checkRoute.patch('/img', setCheckDirectory, imageUploader.single('image'), checkimg);