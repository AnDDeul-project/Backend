import {verify_random, has_family, make_token, match_user, extract_user} from "../dao/random.dao.js";

export const make_random = async(user_id, family_name) => {
    const token = [await make_token()];
    while(await verify_random(token)!=-1){
        token[0] = await make_token();
    }
    const user = await extract_user(user_id);
    const family = await has_family(user);
    if(family!=-1){
        return -1;
    }
    await match_user(user, token, family_name);
    return token;
}