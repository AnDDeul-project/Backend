//check.controller.js

import { verify } from '../service/auth.js';
import { writeCheckService, callCheckService, contentCheckService, dateCheckService, completeCheckService, deleteCheckService, imgCheckService } from '../service/check.service.js';

// 체크리스트 추가
export const addCheck = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("체크리스트를 추가합니다");
    const result = await writeCheckService(snsId, req.body);
    return res.status(200).json({status: 200, isSuccess: true, check: result});
}

// 체크리스트 목록 불러오기
export const getCheck = async (req, res) => {
    let snsId;
    try {
        console.log(1);
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    
    snsId = req.params.mode==false ? snsId[0] : req.params.userid;//0이면 내거 1이면 다른사람거
    if(req.params.mode==1) snsId = req.params.userid;
    console.log("사용자의 체크리스트를 불러옵니다");
    const result = await callCheckService(snsId, req.params.date);
    if(result==-1)
        return res.status(451).json({status:451, isSuccess: false, error: "해당 날짜에 만들어진 체크리스트가 없습니다"});
    return res.status(200).json({status: 200, isSuccess: true, checklist: result});
}

// 체크리스트 내용 수정
export const contentCheck = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("체크리스트 내용을 수정합니다");
    const result = await contentCheckService(req.params.checkid, req.body.content);
    return res.status(200).json({status: 200, isSuccess: true, check: result});
}

// 체크리스트 기한 변경
export const dateCheck = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("체크리스트 기한을 수정합니다");
    const result = await dateCheckService(req.params.checkid, req.params.date);
    return res.status(200).json({status: 200, isSuccess: true, check: result});
}

// 체크리스트 완료여부 변경
export const completeCheck = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("체크리스트 완료여부를 수정합니다");
    const result = await completeCheckService(req.params.checkid);
    return res.status(200).json({status: 200, isSuccess: true, check: result});
}

// 체크리스트 삭제
export const deleteCheck = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("체크리스트를 삭제합니다");
    const result = await deleteCheckService(req.params.checkid);
    return res.status(200).json({status: 200, isSuccess: true, message: "체크리스트를 삭제했습니다"});
}

// 체크리스트 인증샷 추가
export const imgCheck = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    console.log("체크리스트에 이미지를 추가합니다");
    const result = await imgCheckService(req.body.checkid, req.file.location);
    if(result==-1)
        return res.status(450).json({status:450, isSuccess: false, error: "체크리스트 달성 전에는 인증샷을 추가할 수 없습니다"});
    else return res.status(200).json({status: 200, isSuccess: true, check: result});
}