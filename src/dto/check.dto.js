//dto/check.dto.js

// add check response DTO
export const contentCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender_idx, "receiver": user[0].receiver_idx, "content": user[0].content};
}

export const callCheckResponseDTO = (checklist) => {//빈 배열이면 에러 던질까
    return checklist.map(item => ({
        "checkid": item.check_idx,
        "sender": item.sender_idx,
        "complete": item.complete,
        "picture": item.picture==null ? "null" : item.picture,
        "content": item.content
    }));
}

//export const contentCheckResponseDTO = (rowcount) => { return {"affected check count": rowcount};}
export const dateCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender_idx, "receiver": user[0].receiver_idx, "due_date": user[0].due_date};
}
export const completeCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender_idx, "receiver": user[0].receiver_idx, "complete": user[0].complete};
}
export const deleteCheckResponseDTO = (rowcount) => { return {"result": `${rowcount}개의 체크리스트가 삭제되었습니다`};}