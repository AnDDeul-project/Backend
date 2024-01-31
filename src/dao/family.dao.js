import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const check_leader  = async(user_id) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT family_code FROM userfam WHERE user_idx = ?", user_id);
        conn.release();
        console.log(result[0].length);
        if(result[0].length > 0){
            return -1;
        }
        console.log("Here");
        return 1;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const delete_member  = async(user_id) => {
    try{
        console.log(user_id);
        const conn = await pool.getConnection();
        await pool.query("UPDATE user SET family_code = NULL WHERE snsId = ?", user_id);
        conn.release();
        return;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const family = async(family_code) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT user_idx FROM userfam WHERE family_code = ?", family_code);
        conn.release();
        if(result[0][0].user_idx > 0){
            return result[0][0].user_idx;
        }
        return -1;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const find_member = async(user_id) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT nickname FROM user WHERE snsId = ?", user_id);
        console.log(result);
        return result[0][0].nickname;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const add_family = async(user_id, family_code, user_name) => {
    try{
        const conn = await pool.getConnection();
        const content = user_id + "님이 가족 신청을 보냈습니다! 지금 확인하고 반겨주세요:)";
        await pool.query("UPDATE user SET family_code = ? , auth=0 , point = 0 WHERE snsId = ?", [family_code, user_name]);
        await pool.query("INSERT INTO alram (user_idx, checked, content) VALUES (?, ?, ?)", [user_id, 0, content]);
        return;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}