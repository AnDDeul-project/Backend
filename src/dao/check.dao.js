//check.dao.js

import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import moment from 'moment-timezone';
import { find_member } from "./family.dao.js";
import { pushAlarm } from "../service/push.service.js";


// 체크리스트 단일 조회
export const getOne = async (checkid) => {
    try {
        const [result] = await pool.query("SELECT * FROM checklist WHERE check_idx = ?", checkid);
        const sender = await find_member(result[0].sender_idx);
        const receiver = await find_member(result[0].receiver_idx);
        const dueDate = moment(result[0].due_date).format("YYYY-MM-DD");
        let result2 = {...result[0]};
        delete result2.sender_idx;
        delete result2.receiver_idx;
        delete result2.due_date;
        result2 = {...result2, sender, receiver, due_date:dueDate};
        return result2;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const addOne = async (snsid, body) => {
    try {
        const receiver = body.receiver_idx;
        // 기한 구하기
        const dueDate = body.due_date;
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const content = body.content;
        //알림 정보 기록
        const [nick] = await pool.query("SELECT nickname FROM user WHERE snsId = ?", snsid);
        const nickname = nick[0].nickname;
        console.log("받는사람 : "+nick[0].nickname);
        const [receiverToken] = await pool.query("SELECT device_token FROM user WHERE snsId = ?", [receiver]);
        const deviceToken = receiverToken[0].device_token;
        const alarm_content = `${nickname}님의 따듯한 잔소리를 확인해보세요!`;
        // FCM 요청
        pushAlarm(alarm_content, deviceToken);
        const [alarm_idx] = await pool.query("INSERT INTO alarm (user_idx, checked, content, create_at, place) VALUES (?, ?, ?, ?, ?)", [receiver, 0, alarm_content, currentDate, 'checklist']);
        const [result] = await pool.query("INSERT INTO checklist (sender_idx, receiver_idx, due_date, complete, content, create_at, alarm_idx) VALUES (?, ?, ?, 0, ?, ?, ?)", [snsid, receiver, dueDate, content, currentDate, alarm_idx.insertId]);
        
        return result.insertId;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

//날짜별 체크리스트 불러오기
export const getAll = async (snsid, date, mode) => {
    try {
        const [result] = await pool.query("SELECT check_idx, sender_idx, complete, picture, content, alarm_idx FROM checklist WHERE receiver_idx = ? AND due_date = ?", [snsid, date]);
        if(result.length==0) return -1;

        const result2 = await Promise.all(result.map(async (item) => {
            const sender = await find_member(item.sender_idx);
            const newItem = {...item, sender: sender};  
            delete newItem.sender_idx;  // sender_idx 속성 삭제
            return newItem;
        }));
        if(mode=='false') {
            const alarmIdxList = result2.map(item => item.alarm_idx);
            // 알림 읽음처리 추가
            const alarmQuery = `
            UPDATE alarm SET checked=1
            WHERE alarm_idx in (?)`
            await pool.query(alarmQuery, [alarmIdxList]);
        }
        console.log("result2:" + result2);
        return result2;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const changeContent = async (checkid, content) => {
    try {
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await pool.query("UPDATE checklist SET content = ?, modify_at = ? WHERE check_idx = ?", [content, currentDate, checkid]);
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const changeDate = async (checkid, date) => {
    try {
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await pool.query("UPDATE checklist SET due_date = ?, modify_at = ? WHERE check_idx = ?", [date, currentDate, checkid]);
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const changeComplete = async (checkid) => {
    try {
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        await pool.query("UPDATE checklist SET complete = !complete, modify_at = ? WHERE check_idx = ?", [currentDate, checkid]);
        
        //알람 추가
        const [member] = await pool.query("SELECT sender_idx, receiver_idx, alarm_idx FROM checklist WHERE check_idx = ?", checkid);
        const nick = await find_member(member[0].receiver_idx);
        const alarm_content = `${nick}님이 남긴 할 일을 완료했어요`;
        const alarmDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        await pool.query("INSERT INTO alarm (user_idx, checked, content, create_at, place) VALUES (?, ?, ?, ?, ?)", [member[0].sender_idx, 0, alarm_content, alarmDate, 'checklist']);
        
        const [senderToken] = await pool.query("SELECT device_token FROM user WHERE snsId = ?", [member[0].sender_idx]);
        const deviceToken = senderToken[0].device_token;
        // FCM 요청
        pushAlarm(alarm_content, deviceToken);
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const removeOne = async (checkid) => {
    try {
        await pool.query("DELETE FROM checklist WHERE check_idx = ?", checkid);
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

export const putImg = async (checkid, location) => {
    try {
        const [isFinished] = await pool.query("SELECT complete FROM checklist WHERE check_idx = ?", checkid);
        console.log(isFinished[0].complete);
        if(isFinished[0].complete != 1) return -1;
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        await pool.query("UPDATE checklist SET picture = ?, modify_at = ? WHERE check_idx = ?", [location, currentDate, checkid]);
        return 1;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}