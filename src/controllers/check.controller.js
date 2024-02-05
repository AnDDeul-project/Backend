// check.controller.js

import { response } from '../config/response.js';
import { status } from '../config/response.status.js';
import { verify } from '../service/auth.js';

import { joinCheck, callCheck, updateContent, updateDate, updateComplete, deleteCheck, imgCheck } from "../service/check.service.js";

// 리스트 추가
export const checkadd = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log("체크리스트를 추가합니다");

    res.send(response(status.SUCCESS, await joinCheck(snsId, req.body)));
}

// 리스트 불러오기
export const checkget = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    snsId = req.body.mode==false ? snsId : req.body.userid;//0이면 내거 1이면 다른사람거

    console.log(`${snsId}의 ${req.params.date} 체크리스트 목록을 불러옵니다`);

    res.send(response(status.SUCCESS, await callCheck(snsId, req.params.date)));
}

// 할 일 수정
export const checkcontent = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log(`${req.params.checkid} 체크리스트가 수정되었습니다.`);

    res.send(response(status.SUCCESS, await updateContent(req.params.checkid, req.body)));
}

// 날짜 수정
export const checkdate = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log(`${req.params.checkid} 체크리스트의 날짜가 변경되었습니다.`);

    res.send(response(status.SUCCESS, await updateDate(req.params.checkid, req.params.date)));
}

// 할 일 완료 혹은 완료 취소
export const checkcomplete = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log(`${req.params.checkid} 체크리스트가 완료되었습니다.`);

    res.send(response(status.SUCCESS, await updateComplete(req.params.checkid)));
}

// 할 일 삭제
export const checkdelete = async (req, res, next) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log(`${req.params.checkid} 체크리스트를 삭제합니다`);

    res.send(response(status.SUCCESS, await deleteCheck(req.params.checkid)));
}

// 사진 업로드
export const checkimg = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log(`${req.params.checkid} 사진 업로드`);

    res.send(response(status.SUCCESS, await imgCheck(req.params.checkid, req.files.location)));
}