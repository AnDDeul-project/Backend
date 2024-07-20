import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const putToken = async(snsId, token) => {
    try {
        await pool.query("UPDATE user SET device_token = ? WHERE snsId = ?", [token, snsId]);
        const [result] = await pool.query("SELECT device_token FROM user WHERE snsId = ?", [snsId]);
        return result[0].device_token;
    }catch(e){
        console.log(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}