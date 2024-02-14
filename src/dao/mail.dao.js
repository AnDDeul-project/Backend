import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import moment from 'moment-timezone';
export const getOne = async(idx) => {
    try{
        const conn = await pool.getConnection();
        let result = await pool.query("SELECT * FROM postbox WHERE postbox_idx = ?", idx);
        console.log(result);
        const sender = await pool.query("SELECT nickname FROM user WHERE snsId = ?", result[0][0].sender_idx)
        result[0][0].sender_idx = sender[0][0].nickname;
        const reciever = await pool.query("SELECT nickname FROM user WHERE snsId = ?", result[0][0].receiver_idx)
        result[0][0].receiver_idx = reciever[0][0].nickname;
        await pool.query("UPDATE postbox SET is_read = 1 WHERE postbox_idx = ?", idx);
        return result[0];
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}
export const getAll = async(snsId, date) => {
    try{
        const conn = await pool.getConnection();
        let result = await pool.query("SELECT postbox_idx, sender_idx, voice, content, question, is_read FROM postbox WHERE receiver_idx = ? AND send_date = ?", [snsId[0], date]);
        console.log(result);
        for(const user of result[0]){
            console.log(user);
            const sender_nickname = await pool.query("SELECT nickname FROM user WHERE snsId = ?", user.sender_idx);
            user.sender_idx = sender_nickname[0][0].nickname;
        }
        return result[0];
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}
export const sendMail = async(snsId, req) => {
    try{
        console.log(typeof req.body.member);
        const conn = await pool.getConnection();
        const memberArray = req.body.member.split(',').map(Number);
        console.log(memberArray);
        for (const memberId of memberArray) {
            console.log("memberId: " + memberId);
            let content;
            const question = req.body.question;
            const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD');
            if(req.file && req.file.location) {
                content = req.file.location;
                await pool.query("INSERT INTO postbox(sender_idx, receiver_idx, content, voice, send_date, is_read, question) VALUES (?, ?, ?, ?, ?, ?, ?)", [snsId[0], memberId, content, '1', currentDate, '0', question]);
            } else {
                content = req.body.content;
                console.log(content);
                await pool.query("INSERT INTO postbox(sender_idx, receiver_idx, content, voice, send_date, is_read, question) VALUES (?, ?, ?, ?, ?, ?, ?)", [snsId[0], memberId, content, '0', currentDate, '0', question]);
            }
            const now = await pool.query("SELECT point FROM user WHERE snsId = ?", snsId[0]);
            await pool.query("UPDATE user SET point = ? WHERE snsId = ?", [now[0][0].point+1, snsId[0]]);
            const alarm_content = "편지가 도착했어요!! 바로 확인해볼까요??";
            await pool.query("INSERT INTO alram(user_idx, checked, content) VALUES (?, ?, ?)", [memberId, 0, alarm_content]);
        }
        conn.release();
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const getQuestion = async(snsId) => {
    try {
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT family_code FROM user WHERE snsId = ?", snsId);
        if(result[0][0].family_code==null) {
            return -1;
        }
        const result2 = await pool.query("SELECT create_at FROM userfam WHERE family_code = ?", result[0][0].family_code);
        const dbDate = moment(result2[0][0].create_at);
        const currentDate = moment().tz('Asia/Seoul');
        let diffInDays = currentDate.diff(dbDate, 'days');
        diffInDays = diffInDays +1;
        const ques = await pool.query("SELECT content FROM question WHERE question_idx = ?", diffInDays);
        conn.release();
        return ques[0];
    } catch(err) {
        console.log(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, err);
    }
}