//check.service.js

import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

import { addCheckResponseDTO, callCheckResponseDTO, contentCheckResponseDTO, dateCheckResponseDTO, completeCheckResponseDTO, deleteCheckResponseDTO, imgCheckResponseDTO } from "../dto/check.dto.js"
import { addCheckList, getCheck, modifyCheckList, callCheckList, contentCheckList, dateCheckList, finishCheckList, deleteCheckList, imageCheckList } from "../dao/check.dao.js";
import { find_member } from "../dao/family.dao.js";

// 체크리스트 추가
export const joinCheck = async (snsId, body) => {
    const date = new Date(body.due_year, body.due_month-1, body.due_day);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // 월을 2자리 문자열로 만들기 위해 앞에 0을 붙이고, 뒤의 2자리만 추출
    const day = ("0" + date.getDate()).slice(-2); // 일을 2자리 문자열로 만들기 위해 앞에 0을 붙이고, 뒤의 2자리만 추출
    const formattedDate = `${year}-${month}-${day}`; // "YYYY-MM-DD" 형식으로 날짜 문자열 생성

    const joinListData = await addCheckList({
        'sender_idx' : snsId[0],
        'receiver_idx' : body.receiver_idx,
        'due_date' : formattedDate,
        'content' : body.content
    });

    const result = await modifyCheckList(await getCheck(joinListData)); 
    /*
    const sender = await find_member(result[0].sender);
    const receiver = await find_member(result[0].receiver);
    result[0].sender = sender;
    result[0].receiver = receiver;
    */
    console.log(result);

    return result;
}

// 체크리스트 불러오기
export const callCheck = async (userid, date) => {
    const check = await callCheckList(userid, date);
    let sender = [];
    for(let i = 0; i < check.length; i++) {
        sender.push(await find_member(check[i].sender_idx));
    }
    return callCheckResponseDTO(check, sender);
}

// 할 일 수정
export const updateContent = async (checkid, body) => {
    await contentCheckList(checkid, body.content);
    return contentCheckResponseDTO(await modifyCheckList(await getCheck(checkid)));
}

// 할 일 날짜 수정
export const updateDate = async (checkid, date) => {
    await dateCheckList(checkid, date);
    return dateCheckResponseDTO(await modifyCheckList(await getCheck(checkid, date)));
}

// 할 일 완료 혹은 완료 취소
export const updateComplete = async (checkid) => {
    await finishCheckList(checkid);
    return completeCheckResponseDTO(await modifyCheckList(await getCheck(checkid)));
}

// 할 일 삭제
export const deleteCheck = async (checkid) => {
    const check = await deleteCheckList(checkid);
    if(check==1) return deleteCheckResponseDTO(check);
}

// 사진 업로드
export const imgCheck = async (checkid, location) => {
    const result = await imageCheckList(checkid, location);
    if(result==1) return imgCheckResponseDTO(await modifyCheckList(await getCheck(checkid)));
    else if(result == -1) return -1;
}