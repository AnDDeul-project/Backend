import { createPostInDb, getPostsFromDb, getFamilyMembers, getPostById, updatePostById, deletePostById, addEmojiToPost, getUserProfileData, getSinglePostFromDb, updateUserProfileInDb, getUserFamilyCode, updateFamilyMemberAuth } from '../dao/home.dao.js';

export const homeService = {
    // 게시글 작성
    createPost: async (postData) => {
        // 데이터베이스에 게시글 저장
        return await createPostInDb(postData);
    },

    // 게시글 조회
    getPosts: async (user_idx) => {
        return await getPostsFromDb(user_idx);
    },

    // 게시글 수정
    updatePost: async (snsId, postIdx, content) => {
        // 게시글 정보 조회
        const post = await getPostById(postIdx);

        // 게시글이 존재하지 않는 경우
        if (!post) {
            throw new Error('Post not found');
        }

        // 요청한 사용자와 게시글의 소유자가 같은지 확인
        if (String(post.user_idx) !== String(snsId)) {
            console.log(`Logged in user: ${snsId}, Post owner: ${post.user_idx}`);
            throw new Error('You do not have permission to edit this post');
        }

        // 게시글 내용이 비어있는 경우 에러 처리
        if (!content) {
            throw new Error("Content cannot be empty.");
        }

        // 게시글 수정
        await updatePostById(postIdx, content);
    },

    // 게시글 삭제
    deletePost: async (user_idx, post_idx) => {
        // 게시글 정보 조회
        const post = await getPostById(post_idx);

        // 게시글이 존재하지 않는 경우
        if (!post) {
            throw new Error('Post not found');
        }

        console.log("Logged in user:", user_idx); // 로그인한 사용자의 snsId 출력 (배열 형태)
        console.log("Post owner:", post.user_idx); // 게시글 작성자의 user_idx 출력 (문자열 형태)

        // 요청한 사용자가 게시글의 소유자가 아닌 경우 (배열의 첫 번째 요소를 사용하여 비교)
        if (post.user_idx !== user_idx[0]) { // 배열의 첫 번째 요소를 사용하여 비교
            throw new Error('You do not have permission to delete this post');
        }
        // 게시글 삭제
        return await deletePostById(post_idx);
    },

    // 가족 구성원 조회
    getFamilyMembers: async (user_idx) => { 
        return await getFamilyMembers(user_idx);
    },

    // 게시글 이모지 추가
    addEmoji: async (postIdx, snsId, emojiType) => {
        return await addEmojiToPost(postIdx, snsId, emojiType);
    },

    // 특정 유저 프로필 조회
    getUserProfile: async (userId) => {
        return await getUserProfileData(userId);
    },

    getSinglePost: async (postIdx) => {
        return await getSinglePostFromDb(postIdx);
    },

     // 유저 프로필 정보 수정
     updateUserProfile: async (snsId, updateData) => {
        // 데이터베이스에 유저 프로필 정보 업데이트
        return await updateUserProfileInDb(snsId, updateData);
    },

    approveFamilyMember: async (snsId, userId) => {
        // 1. 두 사용자의 family_code가 같은지 검증
        const userFamilyCode = await getUserFamilyCode(snsId);
        const targetFamilyCode = await getUserFamilyCode(userId);

        console.log('userFamilyCode:',userFamilyCode);
        console.log('targetFamilyCode:',targetFamilyCode);
        if (String(userFamilyCode) !== String(targetFamilyCode)) {
            throw new Error("가족 코드가 다릅니다.");
        }
    
        // 2. 대상 유저의 auth 값이 0인지 확인하고 1로 업데이트
        const result = await updateFamilyMemberAuth(snsId);
    
        return result ? "가족 승인이 완료되었습니다." : "승인할 사용자가 이미 승인되었거나 존재하지 않습니다.";
    }
};