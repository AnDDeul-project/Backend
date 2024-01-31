// check.controller.js

import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders.js';
import { response } from '../config/response.js';
import { status } from '../config/response.status.js';

import { joinCheck, callCheck, updateContent, updateDate, updateComplete, deleteCheck, imgCheck } from "../service/check.service.js";

// 리스트 추가
export const checkadd = async (req, res) => {
    console.log("체크리스트를 추가합니다");

    res.send(response(status.SUCCESS, await joinCheck(req.body)));
}

// 리스트 불러오기
export const checkget = async (req, res) => {
    console.log(`${req.body}의 ${req.params.date} 체크리스트 목록을 불러옵니다`);

    res.send(response(status.SUCCESS, await callCheck(req.body, req.params.date)));
}

// 할 일 수정
export const checkcontent = async (req, res) => {
    console.log(`${req.params.checkid} 체크리스트가 수정되었습니다.`);

    res.send(response(status.SUCCESS, await updateContent(req.params.checkid, req.body)));
}

// 날짜 수정
export const checkdate = async (req, res) => {
    console.log(`${req.params.checkid} 체크리스트의 날짜가 변경되었습니다.`);

    res.send(response(status.SUCCESS, await updateDate(req.params.checkid, req.params.date)));
}

// 할 일 완료 혹은 완료 취소
export const checkcomplete = async (req, res) => {
    console.log(`${req.params.checkid} 체크리스트가 완료되었습니다.`);

    res.send(response(status.SUCCESS, await updateComplete(req.params.checkid)));
}

// 할 일 삭제
export const checkdelete = async (req, res, next) => {
    console.log(`${req.params.checkid} 체크리스트를 삭제합니다`);

    res.send(response(status.SUCCESS, await deleteCheck(req.params.checkid)));
}

// 사진 업로드
export const checkimg = async (req, res) => {
    console.log(`${req.params.checkid} 사진 업로드`);

    res.send(response(status.SUCCESS, await imgCheck(req.params.checkid, req.files.location)));
}