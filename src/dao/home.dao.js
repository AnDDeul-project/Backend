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
        throw new Error("유저의 가족코드가 조회되지 않습니다.");
    }

    // 같은 family_code를 가진 사용자의 게시글, 글 작성자의 프로필 사진, 닉네임 및 게시글 고유번호 조회
    const query = `
        SELECT p.post_idx, p.user_idx, p.content, p.picture, u.image AS userImage, u.nickname
        FROM post p
        INNER JOIN user u ON p.user_idx = u.snsId  
        WHERE u.family_code = ?`;  // family_code 조건을 userfam에서 user로 변경 및 작성자의 프로필 사진 정보, 닉네임 및 게시글 고유번호 추가
    try {
        const [rows] = await pool.query(query, [family_code]);
        return rows.map(row => ({
          post_idx: row.post_idx,  // 게시글 고유번호 추가
          user_idx: row.user_idx,
          nickname: row.nickname,  // 사용자 닉네임 추가
          content: row.content,
          picture: JSON.parse(row.picture), // JSON 문자열을 객체로 변환
          userImage: row.userImage // 작성자의 프로필 사진 정보 추가
        }));
    } catch (error) {
        throw error;
    }
};


// 게시글 정보 불러오기
export const getPostById = async (post_idx) => {
    const query = "SELECT * FROM post WHERE post_idx = ?";
    console.log("post_idx:",post_idx);
    const [rows] = await pool.query(query, [post_idx]);
    console.log("rows:",rows);
    return rows[0];
};

// 게시글 수정
export const updatePostById = async (post_idx, content) => {
    const query = "UPDATE post SET content = ? WHERE post_idx = ?";
    const [result] = await pool.query(query, [content, post_idx]);
    return result;
};


// 게시글 삭제
export const deletePostById = async (post_idx) => {
    const query = "DELETE FROM post WHERE post_idx = ?";
    const [result] = await pool.query(query, [post_idx]);
    return result;
};

// 가족 구성원 및 가족 코드 조회 함수
export const getFamilyMembers = async (user_snsId) => {
    // 로그인한 사용자의 가족 코드 조회
    const userFamilyCodeQuery = "SELECT family_code FROM user WHERE snsId = ?";
    const [userFamilyCodeRows] = await pool.query(userFamilyCodeQuery, [user_snsId]);
    const userFamilyCode = userFamilyCodeRows.length > 0 ? userFamilyCodeRows[0].family_code : null;

    if (!userFamilyCode) {
        throw new Error('Family code not found for the user');
    }

    // 같은 가족 코드를 가진 모든 가족 구성원 조회
    const familyMembersQuery = `
        SELECT snsId, nickname, image
        FROM user
        WHERE family_code = ? AND auth = 1`;
    const [familyMembersRows] = await pool.query(familyMembersQuery, [userFamilyCode]);

    // 가족으로 들어오고 싶은 유저 조회 (auth 값이 0인 유저)
    const waitlistQuery = `
        SELECT snsId, nickname, image
        FROM user
        WHERE family_code = ? AND auth = 0`;
    const [waitlistRows] = await pool.query(waitlistQuery, [userFamilyCode]);

    // 로그인한 사용자를 결과 배열의 첫 번째 요소로 배치
    const loginUserIndex = familyMembersRows.findIndex(member => member.snsId === user_snsId);
    if (loginUserIndex > -1) {
        const loginUser = familyMembersRows.splice(loginUserIndex, 1)[0];
        familyMembersRows.unshift(loginUser); // 로그인한 사용자를 배열의 첫 번째 요소로 추가
    }

    // 결과 객체 생성
    const result = {
        me: familyMembersRows[0], // 로그인한 사용자 정보
        family_code: userFamilyCode, // 가족 코드
        family: familyMembersRows.slice(1), // 가족 구성원 정보 (로그인한 사용자 제외)
        waitlist: waitlistRows // 대기 중인 가족 구성원 정보
    };

    return result;
};

export const addEmojiToPost = async (postIdx, user_idx, emojiType) => {
    // 이모지 데이터를 가져옵니다.
    const getEmojiQuery = `SELECT * FROM emoji WHERE post_idx = ?`;
    const [[emojiData]] = await pool.query(getEmojiQuery, [postIdx]);

    if (!emojiData) {
        // 이모지 데이터가 없으면 새로운 레코드를 생성합니다.
        const createEmojiQuery = `INSERT INTO emoji (post_idx, ${emojiType}) VALUES (?, JSON_ARRAY(?))`;
        await pool.query(createEmojiQuery, [postIdx, user_idx]);
    } else {
        // 기존 이모지 데이터에서 사용자 ID를 삭제합니다.
        const emojiTypes = ['happy_emj', 'laugh_emj', 'sad_emj'];
        for (let type of emojiTypes) {
            if (type !== emojiType && emojiData[type]) {
                let emojiList = JSON.parse(emojiData[type] || '[]');
                if (Array.isArray(emojiList) && emojiList.includes(user_idx)) {
                    emojiList = emojiList.filter(id => id !== user_idx);
                    const updateOldEmojiQuery = `UPDATE emoji SET ${type} = ? WHERE post_idx = ?`;
                    await pool.query(updateOldEmojiQuery, [JSON.stringify(emojiList), postIdx]);
                }
            }
        }

        // 새로운 이모지 유형에 사용자 ID를 추가합니다.
        let newEmojiList = JSON.parse(emojiData[emojiType] || '[]');
        if (!newEmojiList.includes(user_idx)) {
            newEmojiList.push(user_idx);
            const updateNewEmojiQuery = `UPDATE emoji SET ${emojiType} = ? WHERE post_idx = ?`;
            await pool.query(updateNewEmojiQuery, [JSON.stringify(newEmojiList), postIdx]);
        }
    }
};
// 유저 프로필 데이터 조회 함수
export const getUserProfileData = async (snsId) => {
    const query = `
        SELECT 
            u.nickname, 
            u.image, 
            COUNT(p.post_idx) AS postCount,
            JSON_ARRAYAGG(
                JSON_EXTRACT(p.picture, '$[0]')
            ) AS firstPostImages
        FROM 
            user u
            LEFT JOIN post p ON u.snsId = p.user_idx
        WHERE 
            u.snsId = ?
        GROUP BY 
            u.snsId
        ORDER BY 
            p.create_at DESC
    `;
    const [rows] = await pool.query(query, [snsId]);
    if (rows.length) {
        // JSON.parse를 사용하여 각 요소를 파싱하고, 첫 번째 요소만 선택하여 새 배열에 저장
        let firstPostImages = rows[0].firstPostImages.map(img => {
            let parsedImg = JSON.parse(img);
            return parsedImg ? parsedImg[0] : null; // 첫 번째 이미지가 있으면 추가, 없으면 null
        });
        return {
            ...rows[0],
            firstPostImages: firstPostImages
        };
    }
    return null;
};
