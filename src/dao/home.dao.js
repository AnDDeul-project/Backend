import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import { pushAlarm } from "../service/push.service.js";
import moment from 'moment-timezone';

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
export const getPostsFromDb = async (user_idx, page) => {
    // 사용자의 family_code 얻기
    const family_code = await getUserFamilyCode(user_idx);
    if (!family_code) {
        throw new Error("유저의 가족코드가 조회되지 않습니다.");
    }
    

    // 게시글, 작성자 정보, 이모지 정보 조회
    const query = `
        SELECT p.post_idx, p.user_idx, p.content, p.picture, p.create_at, u.image AS userImage, u.nickname,
               JSON_CONTAINS(e.happy_emj, JSON_QUOTE(CAST(? AS CHAR))) AS happy_selected,
               JSON_CONTAINS(e.laugh_emj, JSON_QUOTE(CAST(? AS CHAR))) AS laugh_selected,
               JSON_CONTAINS(e.sad_emj, JSON_QUOTE(CAST(? AS CHAR))) AS sad_selected,
               JSON_LENGTH(e.happy_emj) AS happy_count,
               JSON_LENGTH(e.laugh_emj) AS laugh_count,
               JSON_LENGTH(e.sad_emj) AS sad_count
        FROM post p
        INNER JOIN user u ON p.user_idx = u.snsId
        LEFT JOIN emoji e ON p.post_idx = e.post_idx
        WHERE u.family_code = ?
        ORDER BY p.create_at DESC
        LIMIT ?
        OFFSET ?`;

    try {
        const [rows] = await pool.query(query, [user_idx, user_idx, user_idx, family_code, 20, page*20]);
        return {
            count : rows.length,
            data : rows.map(row => ({
            post_idx: row.post_idx,
            user_idx: row.user_idx,
            nickname: row.nickname,
            content: row.content,
            picture: JSON.parse(row.picture),
            create_at: row.create_at,
            userImage: row.userImage,
            emojis: {
                happy: {
                    selected: !!row.happy_selected,
                    count: parseInt(row.happy_count) || 0
                },
                laugh: {
                    selected: !!row.laugh_selected,
                    count: parseInt(row.laugh_count) || 0
                },
                sad: {
                    selected: !!row.sad_selected,
                    count: parseInt(row.sad_count) || 0
                }
            }
        }))}; 
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

    //본인 확인
    const findMe = `
        SELECT snsId, nickname, image
        FROM user
        WHERE snsId = ? AND auth = 1`;
    const [forme] = await pool.query(findMe, user_snsId);

    if(forme.length === 0) {
        return -1;
    }

    // 같은 가족 코드를 가진 모든 가족 구성원 조회
    const familyMembersQuery = `
        SELECT snsId, nickname, image
        FROM user
        WHERE family_code = ? AND auth = 1 AND snsId != ?`;
    const [familyMembersRows] = await pool.query(familyMembersQuery, [userFamilyCode, user_snsId]);

    // 가족으로 들어오고 싶은 유저 조회 (auth 값이 0인 유저)
    const waitlistQuery = `
        SELECT snsId, nickname, image
        FROM user
        WHERE family_code = ? AND auth = 0`;
    const [waitlistRows] = await pool.query(waitlistQuery, [userFamilyCode]);

    // 가족 그룹 이름 조회
    const findFamNameQuery = `
        SELECT fam_name
        FROM userfam
        WHERE family_code = ?`;
    const [famNameRows] = await pool.query(findFamNameQuery, [userFamilyCode]);
    const famName = famNameRows[0].fam_name;

    // 가족장 정보 조회
    const family_leaderQuery = `
    SELECT u.nickname
    FROM user u JOIN userfam uf on u.snsId = uf.user_idx
    WHERE uf.family_code =?`;
    const [family_leader] = await pool.query(family_leaderQuery, [userFamilyCode]);

    // 로그인한 사용자를 결과 배열의 첫 번째 요소로 배치
    const loginUserIndex = [forme, familyMembersRows, waitlistRows];

    // 결과 객체 생성
    const result = {
        family_name: famName,
        family_leader: family_leader[0].nickname,
        me: forme[0], // 로그인한 사용자 정보
        family_code: userFamilyCode, // 가족 코드
        family: loginUserIndex.slice(1)[0], // 가족 구성원 정보 (로그인한 사용자 제외)
        waitlist: waitlistRows // 대기 중인 가족 구성원 정보
    };

    return result;
};

// 이모지 추가
export const addUserToEmoji = async (postIdx, snsId, emojiType) => {
    //일단 이모지 있는지 체크
    const checkExistQuery = 'SELECT EXISTS(SELECT 1 FROM emoji WHERE post_idx = ?) as exist;'
    const [check] = await pool.query(checkExistQuery, [postIdx]);
    
    //이모지 정보가 없으면 추가
    const exist = check[0].exist;
    if (exist==0) {
        const putquery = 'INSERT INTO emoji (post_idx, happy_emj, laugh_emj, sad_emj) VALUES (?, "[]", "[]", "[]");'
        await pool.query(putquery, [postIdx]);
    }
    let typeOfEmoji = emojiType;

    //이모지 정보 불러와
    const getEmojiQuery = `SELECT ${typeOfEmoji} FROM emoji WHERE post_idx = ?`;
    const [emojiDataResult] = await pool.query(getEmojiQuery, [postIdx]);
    let emojiData = emojiDataResult[0][typeOfEmoji];

    //빈 배열이면 추가
    if(emojiData.length === 0) {
        emojiData.push(snsId);
    } else {
        let index = emojiData.indexOf(snsId);

        if(index != -1) {//있으면 지워
            emojiData.splice(index, 1);
        } else {//없으면 추가해
            const [nick] = await pool.query("SELECT nickname FROM user WHERE snsId = ?", snsId);
            const nickname = nick[0].nickname;
            const alarm_content = `${nickname}님이 남긴 반응을 확인해보세요!`
            const [receiverToken] = await pool.query("SELECT snsId, device_token FROM user WHERE snsId = (SELECT user_idx from post WHERE post_idx = ? )", [postIdx]);
            const deviceToken = receiverToken[0].device_token;
            const receiverId = receiverToken[0].snsId;
            console.log("alarm: " + alarm_content);
            console.log("deviceToken: " + deviceToken);
            pushAlarm(alarm_content, deviceToken);
            const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
            await pool.query("INSERT INTO alarm (user_idx, checked, content, create_at, place) VALUES (?, ?, ?, ?, ?)", [receiverId, 0, alarm_content, currentDate, 'home']);
            emojiData.push(snsId);
        }
    }        

    //바뀐 배열을 넣어
    let emojiDataStr = JSON.stringify(emojiData);
    const putEmojiQuery = `UPDATE emoji SET ${typeOfEmoji} = ? WHERE post_idx = ?`;
    await pool.query(putEmojiQuery, [emojiDataStr, postIdx]);

    // 이모지 정보 다시 불러와서 반환
    const getUpdatedEmojiQuery = `SELECT happy_emj, laugh_emj, sad_emj FROM emoji WHERE post_idx = ?`;
    const [[updatedEmojiData]] = await pool.query(getUpdatedEmojiQuery, [postIdx]);

    const parseData = (data) => {
        if (Array.isArray(data)) {
            return data;
        }
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Error parsing data:', error);
            return [];
        }
    };

    const happyData = parseData(updatedEmojiData.happy_emj);
    const laughData = parseData(updatedEmojiData.laugh_emj);
    const sadData = parseData(updatedEmojiData.sad_emj);

    return {
        emojis: {
            happy: {
                selected: happyData.includes(snsId),
                count: happyData.length
            },
            laugh: {
                selected: laughData.includes(snsId),
                count: laughData.length
            },
            sad: {
                selected: sadData.includes(snsId),
                count: sadData.length
            }
        }
    };
};


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
            p.post_idx DESC
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

            firstPostImages.reverse();
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
export const getSinglePostFromDb = async (postIdx, snsId) => {
    const query = `
        SELECT 
            p.post_idx, p.content, p.picture, p.create_at,
            u.nickname, u.image AS userImage,
            JSON_CONTAINS(e.happy_emj, JSON_QUOTE(?)) AS happy_selected,
            JSON_CONTAINS(e.laugh_emj, JSON_QUOTE(?)) AS laugh_selected,
            JSON_CONTAINS(e.sad_emj, JSON_QUOTE(?)) AS sad_selected,
            JSON_LENGTH(e.happy_emj) AS happy_count,
            JSON_LENGTH(e.laugh_emj) AS laugh_count,
            JSON_LENGTH(e.sad_emj) AS sad_count
        FROM 
            post p
            JOIN user u ON p.user_idx = u.snsId
            LEFT JOIN emoji e ON p.post_idx = e.post_idx
        WHERE 
            p.post_idx = ?`;

    try {
        const [rows] = await pool.query(query, [snsId, snsId, snsId, postIdx]);
        if (rows.length > 0) {
            const post = rows[0];
            post.picture = JSON.parse(post.picture); // 사진 정보 JSON 파싱
            return {
                post_idx: post.post_idx,
                user_idx: post.user_idx,
                nickname: post.nickname,
                content: post.content,
                picture: post.picture,
                create_at: post.create_at,
                userImage: post.userImage,
                emojis: {
                    happy: {
                        selected: !!post.happy_selected,
                        count: parseInt(post.happy_count) || 0
                    },
                    laugh: {
                        selected: !!post.laugh_selected,
                        count: parseInt(post.laugh_count) || 0
                    },
                    sad: {
                        selected: !!post.sad_selected,
                        count: parseInt(post.sad_count) || 0
                    }
                }
            };
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
    const alarmQuery = "UPDATE alarm set checked = 1 WHERE alarm_idx = (SELECT alarm_idx FROM user WHERE snsId = ?)";
    await pool.query(alarmQuery, [userId]);
    //FCM 전송
    const [fam] = await pool.query("SELECT fam_name FROM userfam WHERE family_code = (SELECT family_code FROM user WHERE snsId = ?)", [userId]);
    const famName = fam[0].fam_name;
    const [receiverToken] = await pool.query("SELECT device_token FROM user WHERE snsId = ?", [userId]);
    const deviceToken = receiverToken[0].device_token;
    const alarm_content = `${famName}에서 활동을 시작해보세요`;
    pushAlarm(alarm_content, deviceToken);
    const currentDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    await pool.query("INSERT INTO alarm (user_idx, checked, content, create_at, place) VALUES (?, ?, ?, ?, ?)", [userId, 0, alarm_content, currentDate, 'home']);
    return result.affectedRows > 0;  // affectedRows가 0보다 크면 업데이트 성공
};