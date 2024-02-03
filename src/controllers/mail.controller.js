import { response } from '../config/response.js';
import { status } from '../config/response.status.js';
import { verify } from '../service/auth.js';
import { voiceMail } from '../services/mail.service.js';

export const mailvoice = async (req, res) => {
    const snsId = await verify(req, res);
    console.log("음성파일을 업로드합니다");


    res.send(response(status.SUCCESS, await voiceMail(snsId, req.body)));
}