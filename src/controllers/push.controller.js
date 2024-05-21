import express from "express";
import { verify } from '../service/auth.js';
import { makePush, updateToken } from '../service/push.service.js';

export const makeAlarm = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("푸시알림 만들기");
    //사용자 토큰 불러오고
    //내용 넣어서 보내기
    const result = await makePush(snsId);//
}

export const putToken = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("디바이스 토큰 추가하기");
    const result = await updateToken(snsId, req.body.deviceToken);
    if(result===-1)
        return res.status(405).json({status: 403, isSuccess: false, error: "토큰 입력 실패"});//나중에 에러코드 수정하기
    return res.status(200).json({status: 200, isSuccess: true});

}