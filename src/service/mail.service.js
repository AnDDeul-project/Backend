import {sendMail, updatepoint} from "../dao/mail.dao.js"

export const voiceMail = async (snsId, req) => {
    await sendMail(snsId, req);
    await updatepoint(snsId);
    return;
}

export const textMail = async (snsId, req) => {
    await sendMail(snsId, req);
    await updatepoint(snsId);
    return;
}