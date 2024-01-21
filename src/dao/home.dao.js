import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
// 가정: 데이터베이스 연결 및 쿼리 실행을 위한 준비가 되어있음

export const createPostInDb = async ({ user_idx, context, picture }) => {
    const query = 'INSERT INTO post(user_idx, context, picture, create_at, modify_at) VALUES (?, ?, ?, NOW(), NOW())';
    try {
        // const conn = await pool.getConnection();
        console.log("useridx :",user_idx, "context:", context, "picture:",picture);
        const result = await pool.query(query, [user_idx, context, picture]);
        // conn.release();
        console.log("result: ");
        return result;
    } catch (error) {
        // throw new BaseError(status.DB_ERROR, error.message);
    }
};
