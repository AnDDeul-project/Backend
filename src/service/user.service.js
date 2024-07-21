import jwt from "jsonwebtoken";
import { findUser, createUser, deleteUser, has } from "../dao/user.dao.js";
import axios from 'axios';
import { BaseError } from '../config/error.js';
import { status } from "../config/response.status.js";
const formUrlEncoded = (x) =>
    Object.keys(x).reduce((p, c) => p + `&${c}=${encodeURIComponent(x[c])}`, "");

export const logOutKakao = async (kakaoToken) => {
    console.log(kakaoToken);

    try {
        const user = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${kakaoToken}`,
            },
        });
        const {data} = user;
        const result = await axios.post(
            "https://kapi.kakao.com/v1/user/logout",
            formUrlEncoded({
                target_id: data.id,
                target_id_type: "user_id",
            }),
            {
                headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                authorization: `KakaoAK ${process.env.ADMIN_ID}`,
                },
            }
        );

        console.log(result.data); 

        return result.data; 
    } catch (error) {
    }
};

export const unlinkKakao = async (kakaoToken, content) => {
    try {
        const user = await axios.get("https://kapi.kakao.com/v2/user/me", {
            headers: {
                Authorization: `Bearer ${kakaoToken}`,
            },
        });
        const {data} = user;
        const result = await axios.post(
            "https://kapi.kakao.com/v1/user/unlink",
            formUrlEncoded({
                target_id: data.id,
                target_id_type: "user_id",
            }),
            {
                headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                authorization: `KakaoAK ${process.env.ADMIN_ID}`,
                },
            }
        );
        await deleteUser(result.data.id, content);
        return result.data.id; 
    } catch (error) {
        console.error("Error during unlink:", error);
        return -1;
    }
}

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
        if (user==-1) {
            await createUser({
                'email': email, 
                'nickname': nickname, 
                'snsId': snsId, 
                'image': image, 
                'providerType': providerType
            });
     
            return [jwt.sign({ kakao_id: data.id }, process.env.KAKAO_ID, {expiresIn: 864000}), snsId];

        };   
}


export const has_family = async(userid) => {
    const result = await has(userid);
    return result;
}