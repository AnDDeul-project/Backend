import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

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
export const getUserFamilyCode = async (user_idx) => {
    const query = "SELECT family_code FROM user WHERE snsId = ?"; 
    const [rows] = await pool.query(query, [user_idx]);
    return rows.length > 0 ? rows[0].family_code : null;
};

// 게시글 전체 조회
export const getPostsFromDb = async (user_idx) => {
    // 사용자의 family_code 얻기
    const family_code = await getUserFamilyCode(user_idx);
    if (!family_code) {
        throw new Error("유저의 가족코드가 조회되지 않습니다.");
    }

    // 게시글, 작성자 정보, 이모지 정보 조회
    const query = `
        SELECT p.post_idx, p.user_idx, p.content, p.picture, p.create_at, u.image AS userImage, u.nickname,
               JSON_CONTAINS(e.happy_emj, JSON_QUOTE(?)) AS happy_selected,
               JSON_CONTAINS(e.laugh_emj, JSON_QUOTE(?)) AS laugh_selected,
               JSON_CONTAINS(e.sad_emj, JSON_QUOTE(?)) AS sad_selected
        FROM post p
        INNER JOIN user u ON p.user_idx = u.snsId
        LEFT JOIN emoji e ON p.post_idx = e.post_idx
        WHERE u.family_code = ?
        ORDER BY p.create_at DESC`;

    try {
        const [rows] = await pool.query(query, [user_idx, user_idx, user_idx, family_code]);
        return rows.map(row => ({
            post_idx: row.post_idx,
            user_idx: row.user_idx,
            nickname: row.nickname,
            content: row.content,
            picture: JSON.parse(row.picture),
            create_at: row.create_at,
            userImage: row.userImage,
            emojis: {
                happy: {
                    selected: !!row.happy_selected
                },
                laugh: {
                    selected: !!row.laugh_selected
                },
                sad: {
                    selected: !!row.sad_selected
                }
            }
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
    const loginUserIndex = familyMembersRows.findIndex(member => String(member.snsId) === String(user_snsId));
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

// 이모지 작업 시작
export const getEmojiByPostId = async (postIdx) => {
    const [rows] = await pool.query('SELECT * FROM emoji WHERE post_idx = ?', [postIdx]);
    return rows[0];
};

export const createEmojiRow = async (postIdx) => {
    const result = await pool.query('INSERT INTO emoji (post_idx) VALUES (?)', [postIdx]);
    return getEmojiByPostId(postIdx); // 새로 생성된 행 반환
};

export const removeUserFromEmojis = async (postIdx, snsId, emojiType) => {
    const emojiInfo = await getEmojiByPostId(postIdx);
    // console.log("Initial emojiInfo:", emojiInfo);

    const updateEmojiList = (currentEmojiData, type) => {
        let emojiList = [];
    
        try {
            // 현재 이모지 데이터를 JSON 배열로 파싱
            emojiList = JSON.parse(currentEmojiData || '[]');
    
            // emojiList가 배열인지 확인하고, 아니라면 빈 배열로 초기화
            if (!Array.isArray(emojiList)) {
                emojiList = [];
            }
        } catch (e) {
            console.error(`Error parsing emoji data for ${type}:`, e);
            emojiList = [];  // 에러가 발생한 경우 빈 배열로 초기화
        }
        // console.log("emojiList:",emojiList);
        // console.log("type:",type);
        // 요청한 이모지 타입과 일치하는 경우, 사용자 ID가 이미 존재하면 삭제, 존재하지 않으면 추가
        if (type === emojiType) {
            const index = emojiList.indexOf(snsId);
            if (index !== -1) {
                emojiList.splice(index, 1);  // 삭제
            } else {
                emojiList.push(snsId);  // 추가
            }
        } else {
            // 다른 이모지 타입에서는 사용자 ID가 존재하면 삭제
            emojiList = emojiList.filter(id => id !== snsId);
        }
    
        // 수정된 emojiList를 JSON 문자열로 변환하여 반환
        return JSON.stringify(emojiList);
    };
    
    const updatedHappy = updateEmojiList(emojiInfo.happy_emj, 'happy_emj');
    const updatedLaugh = updateEmojiList(emojiInfo.laugh_emj, 'laugh_emj');
    const updatedSad = updateEmojiList(emojiInfo.sad_emj, 'sad_emj');

    // console.log("Updated emoji lists:", { updatedHappy, updatedLaugh, updatedSad });

    await pool.query('UPDATE emoji SET happy_emj = ?, laugh_emj = ?, sad_emj = ? WHERE post_idx = ?', [updatedHappy, updatedLaugh, updatedSad, postIdx]);

    const updatedEmojiInfo = await getEmojiByPostId(postIdx);
    // console.log("Final updated emojiInfo:", updatedEmojiInfo);
    return updatedEmojiInfo;
};


export const addUserToEmoji = async (postIdx, snsId, emojiType) => {
    const emojiInfo = await getEmojiByPostId(postIdx);

    // snsId를 문자열로 변환
    const snsIdStr = snsId.toString();
    let currentEmoji;

    try {
        // emojiInfo[emojiType]이 유효한 JSON 배열인지 확인하고, 아니라면 기본값 '[]'를 사용
        // emojiData가 빈 배열 또는 유효한 JSON 문자열인지 확인
        const emojiData = emojiInfo[emojiType] && emojiInfo[emojiType].length > 0 ? emojiInfo[emojiType] : '[]';
        currentEmoji = JSON.parse(emojiData);

        // currentEmoji가 배열인지 확인하고, 아니라면 빈 배열로 초기화
        if (!Array.isArray(currentEmoji)) {
            currentEmoji = [];
        }

        // 현재 snsId가 배열에 없으면 추가
        if (!currentEmoji.includes(snsIdStr)) {
            currentEmoji.push(snsIdStr);
        }
    } catch (error) {
        console.error("JSON parsing error in addUserToEmoji:", error);
        // 파싱 에러 발생 시 현재 snsIdStr만 포함하는 배열로 초기화
        currentEmoji = [snsIdStr];
    }

    // 변경된 이모지 데이터를 데이터베이스에 업데이트
    await pool.query(`UPDATE emoji SET ${emojiType} = ? WHERE post_idx = ?`, [JSON.stringify(currentEmoji), postIdx]);
    return getEmojiByPostId(postIdx);
};


// export const addEmojiToPost = async (postIdx, user_idx, emojiType) => {
//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const getEmojiQuery = `SELECT * FROM emoji WHERE post_idx = ? FOR UPDATE`;
//         const [[emojiData]] = await connection.query(getEmojiQuery, [postIdx]);

//         if (!emojiData) {
//             const createEmojiQuery = `INSERT INTO emoji (post_idx, ${emojiType}) VALUES (?, JSON_ARRAY(?))`;
//             await connection.query(createEmojiQuery, [postIdx, user_idx]);
//         } else {
//             const emojiTypes = ['happy_emj', 'laugh_emj', 'sad_emj'];

//             for (let type of emojiTypes) {
//                 let emojiList = JSON.parse(emojiData[type] || '[]');

//                 // emojiList가 배열이 아닌 경우를 처리합니다.
//                 if (!Array.isArray(emojiList)) {
//                     emojiList = [];
//                 }

//                 if (type === emojiType) {
//                     const index = emojiList.indexOf(user_idx);
//                     if (index !== -1) {
//                         // 사용자 ID가 이미 존재하면 제거합니다.
//                         emojiList.splice(index, 1);
//                     } else {
//                         // 새로운 사용자 ID를 배열에 추가합니다.
//                         emojiList.push(user_idx);
//                     }
//                 } else {
//                     // 다른 이모지 유형에서 사용자 ID를 제거합니다.
//                     emojiList = emojiList.filter(id => id !== user_idx);
//                 }

//                 const updateEmojiQuery = `UPDATE emoji SET ${type} = ? WHERE post_idx = ?`;
//                 await connection.query(updateEmojiQuery, [JSON.stringify(emojiList), postIdx]);
//             }
//         }

//         await connection.commit();
//     } catch (error) {
//         await connection.rollback();
//         throw error;
//     } finally {
//         connection.release();
//     }
// };



// 이모지 추가, 삭제
// export const addEmojiToPost = async (postIdx, user_idx, emojiType) => {
//     // 이모지 데이터를 가져옵니다.
//     const getEmojiQuery = `SELECT * FROM emoji WHERE post_idx = ?`;
//     const [[emojiData]] = await pool.query(getEmojiQuery, [postIdx]);

//     if (!emojiData) {
//         // 이모지 데이터가 없으면 새로운 레코드를 생성합니다.
//         const createEmojiQuery = `INSERT INTO emoji (post_idx, ${emojiType}) VALUES (?, JSON_ARRAY(?))`;
//         await pool.query(createEmojiQuery, [postIdx, user_idx]);
//     } else {
//         // 기존 이모지 데이터에서 사용자 ID를 삭제합니다.
//         const emojiTypes = ['happy_emj', 'laugh_emj', 'sad_emj'];
//         for (let type of emojiTypes) {
//             if (type !== emojiType && emojiData[type]) {
//                 let emojiList = JSON.parse(emojiData[type] || '[]');
//                 if (Array.isArray(emojiList) && emojiList.includes(user_idx)) {
//                     emojiList = emojiList.filter(id => id !== user_idx);
//                     const updateOldEmojiQuery = `UPDATE emoji SET ${type} = ? WHERE post_idx = ?`;
//                     await pool.query(updateOldEmojiQuery, [JSON.stringify(emojiList), postIdx]);
//                 }
//             }
//         }

//         // 새로운 이모지 유형에 사용자 ID를 추가합니다.
//         let newEmojiList = JSON.parse(emojiData[emojiType] || '[]');
//         if (!newEmojiList.includes(user_idx)) {
//             newEmojiList.push(user_idx);
//             const updateNewEmojiQuery = `UPDATE emoji SET ${emojiType} = ? WHERE post_idx = ?`;
//             await pool.query(updateNewEmojiQuery, [JSON.stringify(newEmojiList), postIdx]);
//         }
//     }
// };

// 특정 유저 프로필 조회
export const getUserProfileData = async (snsId) => {
    const profileQuery = `
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
    `;

    const postIdsQuery = `
        SELECT 
            p.post_idx
        FROM 
            post p
            JOIN user u ON p.user_idx = u.snsId
        WHERE 
            u.snsId = ?
        ORDER BY 
            p.create_at DESC
    `;

    try {
        const [profileRows] = await pool.query(profileQuery, [snsId]);
        const [postIdsRows] = await pool.query(postIdsQuery, [snsId]);

        if (profileRows.length) {
            let firstPostImages = profileRows[0].firstPostImages.map(img => {
                try {
                    const parsedImg = JSON.parse(img);
                    return parsedImg ? parsedImg[0] : null;
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    return null;
                }
            }).filter(img => img !== null);  // null 값 제거;
            let postIdx = postIdsRows.map(row => row.post_idx);

            return {
                nickname: profileRows[0].nickname,
                image: profileRows[0].image,
                postCount: profileRows[0].postCount,
                firstPostImages: firstPostImages,
                postIdx: postIdx 
            };
        }
    } catch (error) {
        throw error;
    }

    return null;
};

// 특정 게시글 1개 조회
export const getSinglePostFromDb = async (postIdx) => {
    const query = `
        SELECT 
            p.post_idx, p.content, p.picture, p.create_at,
            u.nickname, u.image AS userImage
        FROM 
            post p
            JOIN user u ON p.user_idx = u.snsId
        WHERE 
            p.post_idx = ?`;

    try {
        const [rows] = await pool.query(query, [postIdx]);
        if (rows.length > 0) {
            const post = rows[0];
            post.picture = JSON.parse(post.picture); // 사진 정보 JSON 파싱
            return post;
        } else {
            throw new Error("Post not found");
        }
    } catch (error) {
        throw error;
    }
};

// 유저 프로필 정보 수정
export const updateUserProfileInDb = async (snsId, updateData) => {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    values.push(snsId); // WHERE 조건을 위한 snsId 추가

    const query = `UPDATE user SET ${fields} WHERE snsId = ?`;

    try {
        const [result] = await pool.query(query, values);
        return result;
    } catch (error) {
        console.error('DB Error in updating user profile:', error);
        throw error;
    }
};

// 가족 승인
export const updateFamilyMemberAuth = async (userId) => {
    const query = "UPDATE user SET auth = 1 WHERE snsId = ? AND auth = 0";
    const [result] = await pool.query(query, [userId]);
    return result.affectedRows > 0;  // affectedRows가 0보다 크면 업데이트 성공
};