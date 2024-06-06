import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import moment from 'moment-timezone';
import { status } from "../config/response.status.js";
import { log } from "console";

export const check_leader  = async(user_id) => {
    try{
        const result = await pool.query("SELECT family_code FROM userfam WHERE user_idx = ?", user_id);
        console.log(result[0].length);
        if(result[0].length > 0){
            return -1;
        }
        return 1;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const delete_member  = async(user_id) => {
    try{
        await pool.query("UPDATE user SET family_code = NULL WHERE snsId = ?", user_id);
        return 0;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const family = async(family_code) => {
    try{
        const result = await pool.query("SELECT user_idx FROM userfam WHERE family_code = ?", family_code);
        if(result[0][0] != null){
            return result[0][0].user_idx;
        }
        return -1;
    }catch(e){
        log(e);
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const find_member = async(user_id) => {
    try{
        const result = await pool.query("SELECT nickname FROM user WHERE snsId = ?", user_id);
        return result[0][0].nickname;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}
export const family_info = async(family_code) => {
    try{
        const family_name = await pool.query("SELECT fam_name FROM userfam WHERE family_code = ?", family_code);
        const imageResult = await pool.query("SELECT image FROM user WHERE family_code = ? AND auth=1", family_code);
        const countResult = await pool.query("SELECT COUNT(*) FROM user WHERE family_code = ?", family_code);
        return [family_name[0][0].fam_name, imageResult[0], countResult[0][0]['COUNT(*)']];
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}
export const add_family = async(user_id, family_code, user_name, now_user) => {
    try{
        const content = user_id + "님이 가족 신청을 보냈습니다! 지금 확인하고 반겨주세요:)";
        const alarmDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const [alarmIdx] = await pool.query("INSERT INTO alarm (user_idx, checked, content, create_at, place) VALUES (?, ?, ?, ?, ?)", [user_name, 0, content, alarmDate, 'family']);
        await pool.query("UPDATE user SET family_code = ?, auth=0 , point = 0, alarm_idx = ? WHERE snsId = ?", [family_code, alarmIdx.insertId, now_user]);
        return;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}
export const now_request = async(user_id) => {
    try{
        const result = await pool.query("SELECT 1 AS request FROM user WHERE auth = 0 AND snsId = ?", user_id);
        console.log(result[0][0]);
        if(result[0][0] === undefined){
            return false;
        }            
        return true;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}