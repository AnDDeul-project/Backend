import cron from 'node-cron';
import moment from 'moment-timezone';
import { pool } from "../config/db.connect.js";
import { find_member } from "../dao/family.dao.js";
import { pushAlarm } from "../service/push.service.js";

export const checkComplete = async () => {
    const executeJob = async () => {
        const currentDate = moment("2024.07.20").tz("Asia/Seoul").format('YYYY-MM-DD');
        const [receivers] = await pool.query(`SELECT DISTINCT receiver_idx FROM checklist WHERE complete = 0 AND due_date = ?`, [currentDate]);
        for( const receiver of receivers ) {
            const [receiverToken] = await pool.query("SELECT device_token FROM user WHERE snsId = ?", [receiver.receiver_idx]);
            const deviceToken = receiverToken[0].device_token;
            const alarm_content = "아직 못한 일이 남아있어요";
            console.log(deviceToken);
            pushAlarm(alarm_content, deviceToken);
        }
    };

    await executeJob();
    const schedule = cron.schedule(
        "0 0 23 * * *",
        () => {
            executeJob();
        },
        {
            timezone: "Asia/Seoul",
        }
    );
    schedule.start();
}