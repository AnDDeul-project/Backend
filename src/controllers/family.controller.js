import {verify} from "../service/auth.js";
import {add_user, delete_user} from "../service/family.service.js";
export const deleteController = async(req, res) => {
    try{
        const user = await verify(req, res => {
            if (error) {
                // 에러 처리
                return res.status(500).json({status: 500, isSuccess: false, message: "서버 에러, 관리자에게 문의 부탁드립니다."});
            }
    
            // verify 함수가 성공적으로 토큰을 확인했을 때 실행될 코드
            res.send("Verification successful");
            });
        console.log(user[0]);
        const auth = await delete_user(user);
        
        if(auth===-1){
            return res.status(411).json({status: 411, isSuccess:false, error: "가족장은 탈퇴가 불가능합니다! 가족장 위임을 해주세요"});
        }
        return res.status(200).json({status: 200, isSuccess: ture, message : "가족탈퇴가 성공적으로 이루어졌습니다."});
    } catch(err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
}
export const familyController = async(req, res) => {
    try{
        const user = await verify(req, res => {
        if (error) {
            // 에러 처리
            return res.status(500).json({status: 500, isSuccess: false, message: "서버 에러, 관리자에게 문의 부탁드립니다."});
        }

        // verify 함수가 성공적으로 토큰을 확인했을 때 실행될 코드
        res.send("Verification successful");
        })
        const auth = await add_user(user, req.body.family_code);
        console.log(auth);
        if(auth===-1){
            return res.status(410).json({status: 410, isSuccess:false, error: "유효하지 않은 가족코드입니다! 코드를 다시 한 번 확인해주세요!"});
        }
        if(auth===1)
            return res.status(409).json({error: "이미 가족이 존재합니다. 탈퇴를 먼저 진행해주세요!"});
        return res.status(200).json({status: 200, isSuccess: 200, family_code : auth});
    } catch(err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."});
    }
}