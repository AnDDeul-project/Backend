
import { count } from '../dao/alarm.dao.js';

export const countAlarm = async(snsid, place) => {
    const result = await count(snsid, place);
    return result;
}