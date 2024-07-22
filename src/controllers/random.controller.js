import {verify} from "../service/auth.js";
import {make_random} from "../service/random.service.js";

export const randomController = async(req, res) => {
    let user;
    try {
        user = await verify(req, res);
    } catch (err) {
        return;
    }
    const random = await make_random(user, req.body.family_name);
    if(random===-1){
        return res.status(409).json({status: 409, isSuccess: false, error: "이미 가족이 존재합니다. 탈퇴를 먼저 진행해주세요!"});
    }
    return res.status(200).json({status: 200, isSuccess: true, randomToken: random});
}
