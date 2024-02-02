import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const has = async (userId) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT family_code FROM user WHERE snsId = ?", userId);
        conn.release();
        console.log(result[0]);
        if(result[0][0].family_code != null) 
            return true;
        return false;
    }catch(e) {
        throw new BaseError(status,PARAMETER_IS_WRONG, e);
    }
}

export const findUser = async (data) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT snsId FROM user WHERE snsId = ?", data);
        conn.release();
        console.log(result[0]);
        if (result[0].length > 0) {
            return result[0].map(item => item.snsId);
        } else {
            return -1;
        }
    }catch(err){
        throw new BaseError(status.PARAMETER_IS_WRONG, err);
    }
}

export const deleteUser = async (data) => {
    try{
        const conn = await pool.getConnection();
        await pool.query("DELETE FROM user WHERE snsId = ?", data);
        conn.release();
        return;
    }catch(err){
        throw new BaseError(status.PARAMETER_IS_WRONG, err);
    }
}

export const createUser = async (data) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("INSERT INTO user(email, nickname, snsId, providerType, image) VALUES(?, ?, ?, ?, ?)", [data.email, data.nickname, data.snsId, data.providerType, data.image]);
        conn.release();
        return result[0].snsId;
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}