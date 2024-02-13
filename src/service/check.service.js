//check.service.js

import { getOne, addOne, getAll, changeContent, changeDate, changeComplete, removeOne, putImg } from '../dao/check.dao.js';

// 체크리스트 추가
export const writeCheckService = async(snsid, body) => {
    const checkid = await addOne(snsid, body);
    const result = await getOne(checkid);
    return result;
}

// 체크리스트 목록 불러오기
export const callCheckService = async(snsid, date) => {
    const result = await getAll(snsid, date);
    if(result==-1) return -1;
    return result;
}

// 체크리스트 내용 수정
export const contentCheckService = async(checkid, content) => {
    await changeContent(checkid, content);
    const result = await getOne(checkid);
    return result;
}

// 체크리스트 기한 변경
export const dateCheckService = async(checkid, date) => {
    await changeDate(checkid, date);
    const result = await getOne(checkid);
    return result;
}

// 체크리스트 완료여부 변경
export const completeCheckService = async(checkid) => {
    await changeComplete(checkid);
    const result = await getOne(checkid);
    return result;
}

// 체크리스트 삭제
export const deleteCheckService = async(checkid) => {
    await removeOne(checkid);
    return;
}

// 체크리스트 이미지 넣기
export const imgCheckService = async(checkid, location) => {
    const canPut = await putImg(checkid, location);
    if(canPut==-1) return -1;
    const result = await getOne(checkid);
    return result;
}