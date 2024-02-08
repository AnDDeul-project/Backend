//garden.route.js

import express from 'express';
import { getflower, givelove, mypoint, allflower } from '../controllers/garden.controller.js';

export const gardenRoute = express.Router();

// 현재 꽃 불러오기
gardenRoute.get('/flower', getflower);

// 사랑 주기
gardenRoute.put('/flower/givelove', givelove);

// 내 포인트 불러오기
gardenRoute.get('/flower/mypoint', mypoint);

// 정원 -> 전체 꽃 불러오기, 이것만 body에 꽃 번호 전달
gardenRoute.get('/flower/:flowerId', allflower);
