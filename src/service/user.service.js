import { findUser, createUser } from "../dao/user.dao.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { BaseError } from '../config/error.js';
import { status } from "../config/response.status.js";
export const logOutKakao = async (kakaoToken) => {
    console.log(kakaoToken);
    
    try {
        const result = await axios.post(
            "https://kapi.kakao.com/v1/user/unlink",
            null, // 데이터는 null로 설정
            {
                headers: { 
                    Authorization:  `Bearer ${kakaoToken}`,
                },
            }
        );

        console.log(result.data); // result[0] 대신 result.data를 사용

        return result.data; // result[0] 대신 result.data를 반환
    } catch (error) {
        console.error("Error during logout:", error);
        return -1;
    }
};

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