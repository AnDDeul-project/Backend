//check.dao.js

import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import moment from 'moment-timezone';
import { find_member } from "./family.dao.js";


export const getOne = async (checkid) => {
    try {
        const conn = await pool.getConnection();
        const [result] = await pool.query("SELECT * FROM checklist WHERE check_idx = ?", checkid);
        
        const sender = await find_member(result[0].sender_idx);
        const receiver = await find_member(result[0].receiver_idx);
        const result2 = {...result[0], sender, receiver};
        delete result2.sender_idx;
        delete result2.receiver_idx;
        
        conn.release();
        return result2;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const addOne = async (snsid, body) => {
    try {
        const conn = await pool.getConnection();
        const receiver = body.receiver_idx;
        // 기한 구하기
        const date = new Date(body.due_year, body.due_month-1, body.due_day);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2); // 월을 2자리 문자열로 만들기 위해 앞에 0을 붙이고, 뒤의 2자리만 추출
        const day = ("0" + date.getDate()).slice(-2); // 일을 2자리 문자열로 만들기 위해 앞에 0을 붙이고, 뒤의 2자리만 추출
        const dueDate = `${year}-${month}-${day}`; // "YYYY-MM-DD" 형식으로 날짜 문자열 생성
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const content = body.content;
        
        const result = await pool.query("INSERT INTO checklist (sender_idx, receiver_idx, due_date, complete, content, create_at) VALUES (?, ?, ?, 0, ?, ?)", [snsid, receiver, dueDate, content, currentDate]);
        const [nick] = await pool.query("SELECT nickname FROM user WHERE snsID = ?", snsid);
        const alarm_content = `${nick} 님이 해야 할 일을 남기셨어요`;
        await pool.query("INSERT INTO alram (user_idx, checked, content) VALUES (?, ?, ?)", [receiver, 0, alarm_content]);
        conn.release();
        return result[0].insertId;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const getAll = async (snsid, date) => {
    try {
        const conn = await pool.getConnection();
        const [result] = await conn.query("SELECT check_idx, sender_idx, complete, picture, content FROM checklist WHERE receiver_idx = ? AND due_date = ?", [snsid, date]);
        if(result.length==0) return -1;

        const result2 = await Promise.all(result.map(async (item) => {
            console.log(item.sender_idx);
            const sender = await find_member(item.sender_idx);
            const newItem = {...item, sender: sender};  
            delete newItem.sender_idx;  // sender_idx 속성 삭제
            return newItem;
        }));
        conn.release();
        return result2;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const changeContent = async (checkid, content) => {
    try {
        const conn = await pool.getConnection();
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await conn.query("UPDATE checklist SET content = ?, modify_at = ? WHERE check_idx = ?", [content, currentDate, checkid]);
        conn.release();
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const changeDate = async (checkid, date) => {
    try {
        const conn = await pool.getConnection();
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await conn.query("UPDATE checklist SET due_date = ?, modify_at = ? WHERE check_idx = ?", [date, currentDate, checkid]);
        conn.release();
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const changeComplete = async (checkid) => {
    try {
        const conn = await pool.getConnection();
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        await conn.query("UPDATE checklist SET complete = !complete, modify_at = ? WHERE check_idx = ?", [currentDate, checkid]);
        
        //알람 추가
        const [member] = await pool.query("SELECT sender_idx, receiver_idx FROM checklist WHERE check_idx = ?", checkid);
        const nick = await find_member(member[0].receiver_idx);
        const alarm_content = `${nick} 님이 할 일을 완료하셨어요`;
        await pool.query("INSERT INTO alram (user_idx, checked, content) VALUES (?, ?, ?)", [member[0].sender_idx, 0, alarm_content]);
        
        conn.release();
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const removeOne = async (checkid) => {
    try {
        const conn = await pool.getConnection();
        await conn.query("DELETE FROM checklist WHERE check_idx = ?", checkid);
        return;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

export const putImg = async (checkid, location) => {
    try {
        const conn = await pool.getConnection();
        const [isFinished] = await conn.query("SELECT complete FROM checklist WHERE check_idx = ?", checkid);
        console.log(isFinished[0].complete);
        if(isFinished[0].complete != 1) return -1;
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        await conn.query("UPDATE checklist SET picture = ?, modify_at = ? WHERE check_idx = ?", [location, currentDate, checkid]);
        conn.release();
        return 1;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}