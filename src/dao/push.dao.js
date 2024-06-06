import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const putToken = async(snsId, token) => {
    try {
        let result = await pool.query("UPDATE user SET device_token = ? WHERE snsId = ?", [token, snsId]);
        return result[0];
    }catch(e){
        console.log(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}