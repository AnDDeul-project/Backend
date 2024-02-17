
import { verify } from '../service/auth.js';
import { countalram } from '../service/alram.service.js';

export const countAlram = async (req, res) => {
    let snsId;
    try {
        snsId = await verify(req, res);
    } catch (err) {
        return res.status(401).json({status: 401, isSuccess: false, error: "유효하지 않은 토큰입니다."})
    }
    const result = await countalram(snsId, req.params.place);
    return res.status(200).json({status: 200, isSuccess: true, count: result});
}
