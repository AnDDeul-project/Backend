import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const sendMail = async(snsId, req) => {
    try{
        const conn = await pool.getConnection();
        const memberArray = req.body.member.split(',').map(Number);
        for (const memberId of memberArray) {
            console.log("memberId: " + memberId);
            let content;
            if(req.file && req.file.location) {
                content = req.file.location;
                await pool.query("INSERT INTO postbox(sender_idx, receiver_idx, content, voice, send_date) VALUES (?, ?, ?, ?, ?)", [snsId[0], memberId, content, '1', now()]);
            } else {
                content = req.body.text;
                await pool.query("INSERT INTO postbox(sender_idx, receiver_idx, content, voice, send_date) VALUES (?, ?, ?, ?, ?)", [snsId[0], memberId, content, '0', now()]);
            }
            
            const alarm_content = "편지가 도착했어요!! 바로 확인해볼까요??";
            await pool.query("INSERT INTO alram(user_idx, checked, content) VALUES (?, ?, ?)", [memberId, 0, alarm_content]);
        }
        conn.release();
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const updatepoint = async(snsId) => {
    try{
        const conn = await pool.getConnection();
        const now = await pool.query("SELECT point FROM user WHERE snsId = ?", snsId[0]);
        console.log(now[0]);
        await pool.query("UPDATE user SET point = ? WHERE snsId = ?", [now[0][0].point+1, snsId[0]]);
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e)
    }
}
