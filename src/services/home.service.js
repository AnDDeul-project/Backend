import { createPostInDb, getPostsFromDb } from '../dao/home.dao.js';

export const homeService = {
    createPost: async (postData) => {
        // 데이터베이스에 게시글 저장
        return await createPostInDb(postData);
    },
    getPosts: async () => {
        return await getPostsFromDb();
    }
};
