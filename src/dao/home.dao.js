import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
// 가정: 데이터베이스 연결 및 쿼리 실행을 위한 준비가 되어있음

// 게시글 작성
export const createPostInDb = async ({user_idx, content, picture}) => {
    const query = "INSERT INTO post (user_idx, content, picture, create_at, modify_at) VALUES (?, ?, ?, NOW(), NOW())";
    try {
        // const conn = await pool.getConnection();)
        const pictureJson = JSON.stringify(picture);
        const [result] = await pool.query(query, [user_idx, content, pictureJson]);
        return result;
    } catch (error) {
        console.error("DB Error:", error);
        throw new BaseError(status.DB_ERROR, error.message);
    }
};

// 사용자의 family_code 조회
const getUserFamilyCode = async (user_idx) => {
    const query = "SELECT family_code FROM userfam WHERE user_idx = ?";
    console.log("user_idx: ", user_idx);
    const [rows] = await pool.query(query, [user_idx]);
    console.log("rows: ", rows);
    return rows.length > 0 ? rows[0].family_code : null;
};

// 게시글 조회 (수정됨)
export const getPostsFromDb = async (user_idx) => {
    // 사용자의 family_code 얻기
    const family_code = await getUserFamilyCode(user_idx);
    if (!family_code) {
        throw new Error("Family code not found for user");
    }

    // 같은 family_code를 가진 사용자의 게시글만 조회
    const query = `
        SELECT p.user_idx, p.content, p.picture 
        FROM post p
        JOIN userfam u ON p.user_idx = u.user_idx
        WHERE u.family_code = ?`;
    try {
        const [rows] = await pool.query(query, [family_code]);
        return rows;
    } catch (error) {
        throw error;
    }
};

export const getFamilyMembers = async (user_snsId) => {
    const familyCodeQuery = "SELECT family_code FROM userfam WHERE user_idx = ?";
    const [familyCodeRows] = await pool.query(familyCodeQuery, [user_snsId]);
    const familyCode = familyCodeRows[0].family_code;

    const familyMembersQuery = `
        SELECT u.snsId, u.nickname
        FROM user u
        JOIN userfam uf ON u.snsId = uf.user_idx
        WHERE uf.family_code = ?`;

    try {
        const [rows] = await pool.query(familyMembersQuery, [familyCode]);
        // 로그인한 사용자 구별
        return rows.map(member => ({
            nickname: member.snsId === user_snsId ? `${member.nickname} (나)` : member.nickname
        }));
    } catch (error) {
        throw error;
    }
};