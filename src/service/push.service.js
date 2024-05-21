import { putToken } from '../dao/push.dao.js';

export const updateToken = async (snsId, token) => {
    const result = await putToken(snsId, token);
    return result;
}