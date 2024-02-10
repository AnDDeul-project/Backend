//dto/check.dto.js

// add check response DTO
export const addCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender_idx, "receiver": user[0].receiver_idx, "content": user[0].content, "create_at": user[0].create_at};
}

export const callCheckResponseDTO = (checklist, sender) => {//빈 배열이면 에러 던질까
    if (!Array.isArray(checklist)) {
        return {
            "checkid": checklist.check_idx,
            "sender": sender,
            "complete": checklist.complete,
            "picture": checklist.picture===null ? null : checklist.picture,
            "content": checklist.content
        }
    }
    const sender_id = [];
    for(let i = 0; i < sender.length; i++) {
        sender_id.push(sender[i]);
    }
    return checklist.map((item, index) => ({
        "checkid": item.check_idx,
        "sender": sender_id[index],
        "complete": item.complete,
        "picture": item.picture==null ? "null" : item.picture,
        "content": item.content
    }));
};

export const contentCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender, "receiver": user[0].receiver, "content": user[0].content, "modify_at": user[0].modify_at};
}
export const dateCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender, "receiver": user[0].receiver, "due_date": user[0].due_date, "modify_at": user[0].modify_at};
}
export const completeCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender, "receiver": user[0].receiver, "complete": user[0].complete, "modify_at": user[0].modify_at};
}

export const deleteCheckResponseDTO = (rowcount) => { return {"result": `${rowcount}개의 체크리스트가 삭제되었습니다`};}

export const imgCheckResponseDTO = (user) => {
    return {"checkid": user[0].check_idx, "sender": user[0].sender, "receiver": user[0].receiver, "picture": user[0].picture, "modify_at": user[0].modify_at};
}