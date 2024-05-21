import express from "express";
import { verify } from '../service/auth.js';
// import { pushService } from '../service/push.service.js';

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