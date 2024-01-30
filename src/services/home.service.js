import { createPostInDb, getPostsFromDb, getFamilyMembers } from '../dao/home.dao.js';

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
    // 가족 구성원 조회
    getFamilyMembers: async (user_idx) => {
        return await getFamilyMembers(user_idx);
    }
};
