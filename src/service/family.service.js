import {extract_user, has_family, rq_family} from "../dao/random.dao.js";
import {family, nextleader, add_family, find_member, delete_member, check_leader, family_info, now_request} from "../dao/family.dao.js";
export const getinfo = async(family_code) => {
    const check_family = await family(family_code);
    if(check_family===-1)
        return -1;
    const result = await family_info(family_code);
    return result;
}

export const changeleader = async(user_id, user) => {
    const leader = await check_leader(user);
    if(leader===1)
        return -1;
    const new_leader = await has_family(user_id);
    await nextleader(user_id, new_leader[0].family_code);
    return 1;
}

export const add_user = async(token, family_code) => {
    const has = await rq_family(token);
    console.log(has);
    if(has!=-1)
        return 1;
    const check_family = await family(family_code);
    if(check_family===-1)
        return -1;
    const member = await find_member(token);
    add_family(member, family_code, check_family, token);
    return family_code;
}

export const delete_user = async(user) => {
    const leader = await check_leader(user);
    if(leader!=1)
        return -1;
    await delete_member(user);
    return 0;
}

export const getrequest = async(user) => {
    const has = await has_family(user);
    const request = await now_request(user);
    if(has === -1)
        return [false, request];
    return [true, request];
}