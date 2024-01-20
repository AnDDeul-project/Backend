import { signInKakao } from "../service/user.service.js";

export const signInkakao = async (req, res) => {
    console.log(req.headers);
    const headers = req.headers["authorization"];
    const kakaoToken = headers.split(" ")[1];
    const accessToken = await signInKakao(kakaoToken);
    
    return res.status(200).json({ accessToken: accessToken });
};