import {verify} from "../service/auth.js";
import {add_user} from "../service/family.service.js";

export const familyController = async(req, res) => {
    try{
        const user = await verify(req, res => {
        if (error) {
            // 에러 처리
            return res.status(500).send("Error during verification");
        }

        // verify 함수가 성공적으로 토큰을 확인했을 때 실행될 코드
        res.send("Verification successful");
        })
        const auth = await add_user(user, req.body.family_code);
        console.log(auth);
        if(auth===-1){
            return res.status(410).json({error: "유효하지 않은 가족코드입니다! 코드를 다시 한 번 확인해주세요!"});
        }
        if(auth===1)
            return res.status(409).json({error: "이미 가족이 존재합니다. 탈퇴를 먼저 진행해주세요!"});
        return res.status(200).json({family_code : auth});
    } catch(err) {
        return res.status(401).json({error: "유효하지 않은 토큰입니다."});
    }}