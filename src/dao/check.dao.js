//check.dao.js

import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import { insertCheckSQL, getCheckIDSQL, callCheckSQL, contentCheckSQL, dateCheckSQL, finishCheckSQL, deleteCheckSQL, imgCheckSQL } from "./check.sql.js";

// 체크리스트 데이터 삽입
export const addCheckList = async (data) => {
    try{
        const conn = await pool.getConnection();

        const result = await pool.query(insertCheckSQL, [data.sender_idx, data.receiver_idx, data.due_date, 0, null, data.content]);
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

        console.log(check);

        if(check.length==0){
            return -1;
        }

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
    } catch(err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// 할 일 수정하기
export const contentCheckList = async (checkid, content) => {
    try{
        const conn = await pool.getConnection();
        const [result] = await pool.query(contentCheckSQL, [content, now(), checkid]);
        conn.release();
    } catch(err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// 할 일 날짜 바꾸기
export const dateCheckList = async (checkid, date) => {
    try{
        const conn = await pool.getConnection();
        const [result] = await pool.query(dateCheckSQL, [date, now(), checkid]);
        conn.release();
    } catch(err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// 체크리스트 완료 업데이트하기
export const finishCheckList = async (checkid) => {
    try{
        const conn = await pool.getConnection();
        const [result] = await pool.query(finishCheckSQL, now(), checkid);
        conn.release();
    } catch(err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// 할 일 삭제
export const deleteCheckList = async (checkid) => {
    try{
        const conn = await pool.getConnection();
        const [result] = await pool.query(deleteCheckSQL, checkid);
        conn.release();
        return result.affectedRows;
    } catch(err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

export const imageCheckList = async(checkid, location) => {
    try{
        const conn = await pool.getConnection();
        const [result] = await pool.query(imgCheckSQL, [location, now(), checkid]);
        conn.release();
    } catch(err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}