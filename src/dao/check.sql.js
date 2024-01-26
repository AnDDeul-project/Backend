//check.sql.js

export const insertCheckSQL = "INSERT INTO checklist (sender_idx, receiver_idx, due_date, complete, picture, content) VALUES ( ?, ?, ?, ?, ?, ?);";

export const getCheckIDSQL = "SELECT * FROM checklist WHERE check_idx = ?";

export const callCheckSQL = "SELECT check_idx, sender_idx, complete, picture, content FROM checklist WHERE receiver_idx = ? AND due_date = ?";

export const finishCheckSQL = "UPDATE checklist SET complete = !complete WHERE check_idx = ?"

export const contentCheckSQL = "UPDATE checklist SET content = ? WHERE check_idx = ?";

export const dateCheckSQL = "UPDATE checklist SET due_date = ? WHERE check_idx = ?";

export const deleteCheckSQL = "DELETE FROM checklist WHERE check_idx = ?";