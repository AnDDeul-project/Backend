import { getOne, cal_point, getPoint, getAll } from "../dao/garden.dao.js"

export const flower = async(snsid) => {
    const result = await getOne(snsid);
    if(result == -1)
        return -1;
    return result;
}

export const usePoint = async(snsid) => {
    const result = await cal_point(snsid);
    if(result == -1)
        return -1;
    if(result == -2)
        return -2;
    return result;
}

export const callPoint = async(snsid) => {
    const result = await getPoint(snsid);
    return result;
}

export const garden = async(snsId, flowerId) => {
    const result = await getAll(snsId, flowerId);
    if(result == -1)
        return -1;
    return result;
}