import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
// 가정: 데이터베이스 연결 및 쿼리 실행을 위한 준비가 되어있음

// 게시글 작성
export const createPostInDb = async ({user_idx, content, picture}) => {
    const query = "INSERT INTO post (user_idx, content, picture, create_at, modify_at) VALUES (?, ?, ?, NOW(), NOW())";
    try {
        // const conn = await pool.getConnection();
        const pictureJson = JSON.stringify(picture);
        const [result] = await pool.query(query, [user_idx, content, pictureJson]);
        return result;
    } catch (error) {
        console.error("DB Error:", error);
        throw new BaseError(status.DB_ERROR, error.message);
    }
};

// 게시글 조회
export const getPostsFromDb = async () => {
    const query = "SELECT user_idx, content, picture FROM post";
    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        throw error;
    }
};