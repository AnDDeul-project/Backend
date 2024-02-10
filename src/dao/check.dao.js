//check.dao.js

import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import moment from 'moment-timezone';
import { find_member } from "../dao/family.dao.js";
import { insertCheckSQL, getCheckIDSQL, callCheckSQL, contentCheckSQL, dateCheckSQL, finishCheckSQL, deleteCheckSQL, imgCheckSQL } from "./check.sql.js";


// 결과값 구성원 id를 닉네임으로 변경
export const modifyCheckList = async(check) => {
    try{
        console.log(check);
        check[0].sender = check[0].sender_idx;
        check[0].receiver = check[0].receiver_idx;
        delete check[0].sender_idx;
        delete check[0].receiver_idx;
        const sender = await find_member(check[0].sender);
        const receiver = await find_member(check[0].receiver);
        check[0].sender = sender;
        check[0].receiver = receiver;
        return check
    } catch(err){
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

// 체크리스트 데이터 삽입
export const addCheckList = async (data) => {
    try{
        const conn = await pool.getConnection();
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const result = await pool.query(insertCheckSQL, [data.sender_idx, data.receiver_idx, data.due_date, 0, null, data.content, currentDate]);
        conn.release();
        return result[0].insertId;
    }catch (err){
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

//체크리스트 하나 조회
export const getCheck = async (checkid) => {
    try{
        const conn = await pool.getConnection();
        const [check] = await pool.query(getCheckIDSQL, checkid);

        if(check.length==0){
            return -1;
        }
        /*
        check[0].sender = check[0].sender_idx;
        check[0].receiver = check[0].receiver_idx;
        delete check[0].sender_idx;
        delete check[0].receiver_idx;
        */
        //console.log(check);
        conn.release();
        return check;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

//체크리스트 목록 불러오기
export const callCheckList = async (userid, date) => {
    try{
        const conn = await pool.getConnection();
        const [rows] = await pool.query(callCheckSQL, [userid, date]);

        conn.release();

        if(!Array.isArray(rows)) {
            return [];
        }
        const checklist = rows.map(row => ({
            "check_idx" : row.check_idx,
            "sender_idx" : row.sender_idx,
            "complete" : row.complete,
            "picture" : row.picture==null ? "null" : row.picture,
            "content" : row.content
        }));

        return checklist;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

// 할 일 수정하기
export const contentCheckList = async (checkid, content) => {
    try{
        const conn = await pool.getConnection();
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await pool.query(contentCheckSQL, [content, currentDate, checkid]);
        conn.release();
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

// 할 일 날짜 바꾸기
export const dateCheckList = async (checkid, date) => {
    try{
        const conn = await pool.getConnection();
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await pool.query(dateCheckSQL, [date, currentDate, checkid]);
        conn.release();
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

// 체크리스트 완료 업데이트하기
export const finishCheckList = async (checkid) => {
    try{
        const conn = await pool.getConnection();
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await pool.query(finishCheckSQL, [currentDate, checkid]);
        conn.release();
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

// 할 일 삭제
export const deleteCheckList = async (checkid) => {
    try{
        const conn = await pool.getConnection();
        const [result] = await pool.query(deleteCheckSQL, checkid);
        conn.release();
        return result.affectedRows;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

//이미지 추가
export const imageCheckList = async(checkid, location) => {
    try{
        const conn = await pool.getConnection();
        const isfinished = await pool.query("SELECT complete FROM checklist WHERE check_idx = ?", checkid);
        if(isfinished[0][0].complete != 1) {
            return -1;
        }
        const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [result] = await pool.query(imgCheckSQL, [location, currentDate, checkid]);
        conn.release();
        return 1;
    } catch (err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}