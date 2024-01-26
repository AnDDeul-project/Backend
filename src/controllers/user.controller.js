import { signInKakao, logOutKakao, unlinkKakao} from "../service/user.service.js";

export const signInkakao = async (req, res) => {
    try{
    console.log(req.headers);
    const headers = req.headers["authorization"];
    const kakaoToken = headers.split(" ")[1];
    const accessToken = await signInKakao(kakaoToken);
    
    return res.status(200).json({status: 200, isSuccess: true, accessToken: accessToken });
    }catch(err){
        return res.status(500).json({status: 500, isSuccess: false, message: "서버 에러, 관리자에게 문의 바랍니다."});
    }
};

export const signOutKakao = async (req, res) => {
    try{
        const headers = req.headers["authorization"];
        const kakaoToken = headers.split(" ")[1];
        const result = await logOutKakao(kakaoToken);
        return res.status(200).json({ status: 200, isSuccess: true, message: "로그아웃 성공"});
    }catch(errors){
        return res.status(500).json({ status: 500, isSuccess: false, message: "서버 에러, 관리자에게 문의 바랍니다."});
    }
};

export const unLinkKakao = async (req, res) => {
    try{
        const headers = req.headers["authorization"];
        const kakaoToken = headers.split(" ")[1];
        const result = await unlinkKakao(kakaoToken);
        return res.status(200).json({ status: 200, isSuccess: true, message: "탈퇴 성공"});
    }catch(errors){
        return res.status(500).json({status: 500, isSuccess: false, message: "서버 에러, 관리자에게 문의 바랍니다."});
    }
}