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
    const query = "SELECT family_code FROM user WHERE snsId = ?"; 
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
        INNER JOIN user u ON p.user_idx = u.snsId  
        WHERE u.family_code = ?`;  // family_code 조건을 userfam에서 user로 변경
    try {
        const [rows] = await pool.query(query, [family_code]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// 가족 구성원 및 가족 코드 조회 함수
export const getFamilyMembers = async (user_snsId) => {
    // 로그인한 사용자의 가족 코드 조회
    const userFamilyCodeQuery = "SELECT family_code FROM user WHERE snsId = ?";
    const [userFamilyCodeRows] = await pool.query(userFamilyCodeQuery, [user_snsId[0]]);
    const userFamilyCode = userFamilyCodeRows.length > 0 ? userFamilyCodeRows[0].family_code : null;

    if (!userFamilyCode) {
        throw new Error('Family code not found for the user');
    }

    // 같은 가족 코드를 가진 모든 가족 구성원 조회
    const familyMembersQuery = `
        SELECT snsId, nickname, image
        FROM user
        WHERE family_code = ?`;
    const [rows] = await pool.query(familyMembersQuery, [userFamilyCode]);

    // 로그인한 사용자를 결과 배열의 첫 번째 요소로 배치
    const loginUserIndex = rows.findIndex(member => member.snsId === user_snsId[0]);
    if (loginUserIndex > -1) {
        const loginUser = rows.splice(loginUserIndex, 1)[0];
        rows.unshift(loginUser); // 로그인한 사용자를 배열의 첫 번째 요소로 추가
    }

    // 결과 배열의 두 번째 인덱스에 가족 코드 정보 삽입
    rows.splice(1, 0, { family_code: userFamilyCode });

    // 최종 결과 반환
    return rows.map(member => member.family_code ? member : {
        snsId: member.snsId,
        nickname: member.nickname,
        image: member.image
    });
};