import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const count = async(snsId, place) => {
    try{
        const conn = await pool.getConnection();
        const result = await pool.query("SELECT COUNT(*) AS COUNT FROM alram WHERE user_idx = ? AND checked = ? AND place = ?", [snsId, 0, place]);
        console.log(snsId, place);
        return result[0][0].COUNT;
    }catch(e){
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}