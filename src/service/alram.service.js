
import { count } from '../dao/alram.dao.js';

export const countalram = async(snsid, place) => {
    const result = await count(snsid[0], place);
    return result;
}