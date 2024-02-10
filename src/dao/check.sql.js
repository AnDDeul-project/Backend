//check.sql.js

export const insertCheckSQL = "INSERT INTO checklist (sender_idx, receiver_idx, due_date, complete, picture, content, create_at) VALUES ( ?, ?, ?, ?, ?, ?, ?) ;";

export const getCheckIDSQL = "SELECT * FROM checklist WHERE check_idx = ?";

export const callCheckSQL = "SELECT check_idx, sender_idx AS sender, complete, picture, content FROM checklist WHERE receiver_idx = ? AND due_date = ?";

export const contentCheckSQL = "UPDATE checklist SET content = ?, modify_at = ? WHERE check_idx = ?";

export const dateCheckSQL = "UPDATE checklist SET due_date = ?, modify_at = ? WHERE check_idx = ?";

export const finishCheckSQL = "UPDATE checklist SET complete = !complete, modify_at = ? WHERE check_idx = ?";

export const deleteCheckSQL = "DELETE FROM checklist WHERE check_idx = ?";

export const imgCheckSQL = "UPDATE checklist SET picture = ?, modify_at = ? WHERE check_idx = ?";