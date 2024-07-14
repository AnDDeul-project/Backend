
import { count } from '../dao/alarm.dao.js';

export const countAlarm = async(snsid, place) => {
    const result = await count(snsid[0], place);
    return result;
}