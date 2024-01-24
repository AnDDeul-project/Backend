import { signInKakao, logOutKakao, unlinkKakao} from "../service/user.service.js";

export const signInkakao = async (req, res) => {
    console.log(req.headers);
    const headers = req.headers["authorization"];
    const kakaoToken = headers.split(" ")[1];
    const accessToken = await signInKakao(kakaoToken);
    
    return res.status(200).json({ accessToken: accessToken });
};

export const signOutKakao = async (req, res) => {
    try{
        const headers = req.headers["authorization"];
        const kakaoToken = headers.split(" ")[1];
        const result = await logOutKakao(kakaoToken);
        return res.status(200).json({ message: "로그아웃 성공"});
    }catch(errors){
        return res.status(500).json({message: errors});
    }
};

export const unLinkKakao = async (req, res) => {
    try{
        const headers = req.headers["authorization"];
        const kakaoToken = headers.split(" ")[1];
        const result = await unlinkKakao(kakaoToken);
        return res.status(200).json({ message: "탈퇴 성공"});
    }catch(errors){
        return res.status(500).json({message: errors});
    }
}