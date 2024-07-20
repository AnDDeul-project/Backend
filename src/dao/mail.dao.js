import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import moment from 'moment-timezone';
import { pushAlarm } from "../service/push.service.js";

export const getOne = async(idx) => {
    try{
        //const conn = await pool.getConnection();
        let [result] = await pool.query("SELECT * FROM postbox WHERE postbox_idx = ?", idx);
        console.log(result);
        const [sender] = await pool.query("SELECT nickname FROM user WHERE snsId = ?", result[0].sender_idx)
        result[0].sender_idx = sender[0].nickname;
        const [reciever] = await pool.query("SELECT nickname FROM user WHERE snsId = ?", result[0].receiver_idx)
        result[0].receiver_idx = reciever[0].nickname;
        await pool.query("UPDATE postbox SET is_read = 1 WHERE postbox_idx = ?", idx);
        const alarmQuery = `
        UPDATE alarm SET checked=1
        WHERE alarm_idx = (SELECT alarm_idx FROM postbox WHERE postbox_idx = ?)`
        await pool.query(alarmQuery, [idx]);
        return result[0];
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}
export const getAll = async(snsId, date) => {
    try{
        //const conn = await pool.getConnection();
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
        const memberArray = req.body.member.split(',').map(Number);
        for (const memberId of memberArray) {
            let content;
            const question = req.body.question;
            const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD');
            const alarmDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
            //알림 정보 기록
            const [nick] = await pool.query("SELECT nickname FROM user WHERE snsID = ?", snsId);
            const [receiverToken] = await pool.query("SELECT device_token FROM user WHERE snsId = ?", [memberId]);
            const deviceToken = receiverToken[0].device_token;
            const alarm_content = `${nick[0].nickname}님이 편지를 보내셨어요`;
            // FCM 요청
            pushAlarm(alarm_content, deviceToken);
            const [alarm_idx] = await pool.query("INSERT INTO alarm(user_idx, checked, content, create_at, place) VALUES (?, ?, ?, ?, ?)", [memberId, 0, alarm_content, alarmDate, "postbox"]);
            if(req.file && req.file.location) {
                content = req.file.location;
                await pool.query("INSERT INTO postbox(sender_idx, receiver_idx, content, voice, send_date, is_read, question, create_at, alarm_idx) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [snsId, memberId, content, '1', currentDate, '0', question, alarmDate, alarm_idx.insertId]);
            } else {
                content = req.body.content;
                await pool.query("INSERT INTO postbox(sender_idx, receiver_idx, content, voice, send_date, is_read, question, create_at, alarm_idx) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [snsId, memberId, content, '0', currentDate, '0', question, alarmDate, alarm_idx.insertId]);
            }
        }
        await pool.query("UPDATE user SET point = point + ? WHERE snsId = ?", [memberArray.length, snsId]);
    }catch(e){
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}

export const getQuestion = async(snsId) => {
    try {
        //const conn = await pool.getConnection();
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
        //conn.release();
        return ques[0];
    } catch(err) {
        console.log(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, err);
    }
}