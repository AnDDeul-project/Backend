import {sendMail, getAll, getOne, getQuestion} from "../dao/mail.dao.js"

export const getOnePost = async (idx) => {
    const result = await getOne(idx);
    return result;
}
export const getAllPost = async (snsId, date) => {
    const result = await getAll(snsId, date);
    return result;
}
export const voiceMail = async (snsId, req) => {
    await sendMail(snsId, req);
    return;
}

export const textMail = async (snsId, req) => {
    await sendMail(snsId, req);
    return;
}

export const checkQuestion = async (snsId) => {
    const result = await getQuestion(snsId);
    if(result == -1) return -1;
    return result;
}