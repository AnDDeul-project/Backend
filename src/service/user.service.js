import { findUser, createUser } from "../dao/user.dao.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { BaseError } from '../config/error.js';
import { status } from "../config/response.status.js";

export const signInKakao = async (kakaoToken) => {
    const result = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
            Authorization: `Bearer ${kakaoToken}`,
        },
    });
    const {data} = result
    const nickname = data.properties.nickname;
    const email = data.kakao_account.email;
    const snsId = data.id;
    const image = data.properties.profile_image;
    const providerType = "kakao";

    if (!nickname || !email || !snsId) throw new BaseError(status.BAD_REQUEST);

    const user = await findUser(snsId);
    console.log(user);
    if (user==-1) {
        await createUser({
            'email': email, 
            'nickname': nickname, 
            'snsId': snsId, 
            'image': image, 
            'providerType': providerType
        });
    }

    return jwt.sign({ kakao_id: user }, process.env.KAKAO_ID);
    
};