import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import crypto from "crypto";

export const verify_random = async (data) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT snsId FROM user WHERE family_code = ?", data[0]);
        conn.release();
        if (result[0].length === 0) {
            return -1;
        } else {
            return data;
        }
    }catch(err){
        throw new BaseError(status.PARAMETER_IS_WRONG, err);
    }
}

export const make_token = async() => {
    const random = crypto.randomBytes(8).toString('hex');
    return random;
}

export const extract_user = async(data) => {
    const result = await data;
    const extractedNumber = result[0];
    console.log(extractedNumber);
    return extractedNumber;
}

export const has_family = async(data) => {
    try{
        const conn = pool.getConnection();
        const result = await pool.query("SELECT family_code FROM user WHERE snsId = ?", data);
        console.log(result[0]);
        if(result[0][0].family_code === null){
            return -1;
        } else {
            return result[0];
        }
    } catch(err){
        throw new BaseError(status.PARAMETER_IS_WRONG, err);
    }
}

export const match_user = async (user_id, token) => {
    try{
        const conn = await pool.getConnection();
        console.log(token[0], user_id);
        const result = await pool.query("UPDATE user SET family_code = ? , auth=1 , point = 0 WHERE snsId = ?", [token[0], user_id]);
        await pool.query("INSERT INTO userfam(family_code, user_idx) VALUES (?, ?)", [token[0], user_id]);
        conn.release();
        console.log(result[0]);
        if (result[0].length > 0) {
            return token;
        } else {
            return -1;
        }
    }catch(err){
        throw new BaseError(status.PARAMETER_IS_WRONG, err);
    }
}