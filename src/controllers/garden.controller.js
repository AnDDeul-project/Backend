import { response } from '../config/response.js';
import { status } from '../config/response.status.js';
import { verify } from '../service/auth.js';
import { flower, usePoint, callPoint, garden } from '../service/garden.service.js';

export const getflower = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("우리 가족 꽃을 불러옵니다");
    const result = await flower(snsId);
    return res.status(200).json({status: 200, isSuccess: true, flower: result});
}


export const givelove = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("꽃에게 사랑을 줍니다");
    const result = await usePoint(snsId);
    return res.status(200).json({status: 200, isSuccess: true, img: result});
}


export const mypoint = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("내 포인트를 불러옵니다");
    const result = await callPoint(snsId);
    return res.status(200).json({status: 200, isSuccess: true, point: result});
}


export const allflower = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("정원 모든 꽃 정보를 불러옵니다");
    const result = await garden(snsId, req.params.flowerId);
    return res.status(200).json({status: 200, isSuccess: true, garden: result});
}