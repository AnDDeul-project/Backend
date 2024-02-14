import { response } from '../config/response.js';
import { status } from '../config/response.status.js';
import { verify } from '../service/auth.js';
import { voiceMail, textMail, getAllPost, getOnePost, checkQuestion } from '../service/mail.service.js';
export const getOne = async (req, res) => {
    let snsId;
    try{
        snsId = await verify(req, res);
    }catch(err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    const result = await getOnePost(req.params.idx);
    return res.status(200).json({status: 200, isSuccess: true, post : result});
}

export const getAll = async (req, res) => {
    let snsId;
    try{
        snsId = await verify(req, res);
    }catch(err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log(snsId);
    const result = await getAllPost(snsId, req.params.today);
    return res.status(200).json({status: 200, isSuccess: true, post : result});
}

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
    return res.status(200).json({status: 200, isSuccess: true, message: "성공하셨습니다:)"});
}

export const getQuestion = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
    console.log("오늘의 질문을 불러옵니다");
    const result = await checkQuestion(snsId);
    if(result==-1)
        return res.status(405).json({status: 403, isSuccess: false, error: "아직 가족이 없습니다! 가족장의 승인을 받아주세요"});
    return res.status(200).json({status:200, isSuccess: true, question: result});
}