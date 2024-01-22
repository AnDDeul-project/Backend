import {verify} from "../service/auth.js";
import {make_random} from "../service/random.service.js";

export const randomController = async(req, res) => {
try{
    const user = await verify(req, res => {
        if (error) {
            // 에러 처리
            return res.status(500).send("Error during verification");
        }

        // verify 함수가 성공적으로 토큰을 확인했을 때 실행될 코드
        res.send("Verification successful");
    })
    const random = await make_random(user);
    if(random===-1){
        return res.status(409).json({error: "이미 가족이 존재합니다. 탈퇴를 먼저 진행해주세요!"});
    }
    return res.status(200).json({randomToken: random});
} catch(err) {
    return res.status(401).json({error: "유효하지 않은 토큰입니다."});
}}