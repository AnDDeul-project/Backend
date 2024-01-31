import {extract_user, has_family} from "../dao/random.dao.js";
import {family, add_family, find_member, delete_member, check_leader} from "../dao/family.dao.js";

export const add_user = async(token, family_code) => {
    const has = await has_family(token[0]);
    if(has!=-1)
        return 1;
    const check_family = await family(family_code);
    if(check_family===-1)
        return -1;
    const member = await find_member(token[0]);
    add_family(member, family_code, check_family, token[0]);
    return family_code;
}

export const delete_user = async(user) => {
    const leader = await check_leader(user[0]);
    console.log(leader);
    if(leader!=1)
        return -1;
    await delete_member(user[0]);
    return 0;
}