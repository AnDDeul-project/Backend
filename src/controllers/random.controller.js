import {verify} from "../service/auth.js";
import {make_random} from "../service/random.service.js";

export const randomController = async(req, res) => {
try{
    const user = await verify(req, res => {
        if (error) {
            // 에러 처리
            return res.status(500).json({status: 500, isSuccess: false, message: "서버 에러, 관리자에게 문의 부탁드립니다."});
        }

        // verify 함수가 성공적으로 토큰을 확인했을 때 실행될 코드
        res.send("Verification successful");
    })
    const random = await make_random(user, req.body.family_name);
    if(random===-1){
        return res.status(409).json({status: 409, isSuccess: false, error: "이미 가족이 존재합니다. 탈퇴를 먼저 진행해주세요!"});
    }
    return res.status(200).json({status: 200, isSuccess: true, randomToken: random});
} catch(err) {
    return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
}}
