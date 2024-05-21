import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const updateToken = async(snsId, token) => {
    try {
        let result = await pool.query("UPDATE user SET token = ? WHERE snsId = ?", [snsId, token]);
        return result[0];
    }catch(e){
        console.log(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, e);
    }
}