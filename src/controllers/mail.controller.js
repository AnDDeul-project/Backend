import { response } from '../config/response.js';
import { status } from '../config/response.status.js';
import { verify } from '../service/auth.js';
import { voiceMail, textMail } from '../service/mail.service.js';

export const mailvoice = async (req, res) => {
    let snsId;
    try{
        snsId = await verify(req, res);
    }catch(err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log("음성파일을 업로드합니다");
    await voiceMail(snsId, req);
    return res.status(200).json({status: 200, isSuccess: true, message: "성공하셨습니다:)"});
}

export const mailtext = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log("텍스트 편지를 전송합니다");
    await textMail(snsId, req);
    return res.status(200).json({status: 200, isSuccess: true, message: "성공하셨습니다."});
}