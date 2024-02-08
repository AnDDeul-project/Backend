import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";


const ranges = [0.2, 0.4, 0.6, 0.8, 1];
const images = ['img_0', 'img_1', 'img_2', 'img_3', 'img_4', 'img_5'];


export const getOne = async(snsid) => {
    try{
        const conn = await pool.getConnection();
        //꽃 이름, 포인트 가져와
        const result = await pool.query("SELECT f_num, f_point FROM user JOIN userfam ON user.family_code = userfam.family_code WHERE snsId = ?", snsid);
       
        //사진 가져와야 하니까 포인트 얼마나 필요한지 가져와
        const num = result[0][0].f_num;
        const point = result[0][0].f_point;
        const result2 = await pool.query("SELECT required FROM flower WHERE idx = ?", num);
       
        //이제 꽃 사진 가져오자 + 이름도 같이
        const standard = result2[0][0].required;
        console.log(result2);
        let img;
        for(let i = 0; i < ranges.length; i++) {
            if(point<ranges[i]*standard || point===standard) {
                img = images[i];
                console.log(img);
                break;
            }
        }
        const result3 = await pool.query(`SELECT name, ${img} FROM flower WHERE idx = ?`, num);
        conn.release();
        //꽃 번호, 포인트, 이름, 그림
        return {idx: num, point: point, name: result3[0].name, img: result3[0][img]};
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

export const cal_point = async(snsid) => {
    try {
        const conn = await pool.getConnection();
        await pool.query("UPDATE user SET point = point - 1 WHERE snsId = ?", snsid);
        const result = await pool.query("SELECT family_code FROM user WHERE snsId = ?", snsid);
        await pool.query("UPDATE userfam SET f_point = f_point + 1 WHERE family_code = ?", result[0][0].family_code);
        //포인트 다 채우면 꽃 바꾸고 포인트 0으로
        const result2 = await pool.query("SELECT f_num, f_point FROM userfam WHERE family_code = ?", result[0][0].family_code);
        const result3 = await pool.query("SELECT required FROM flower WHERE idx = ?", result2[0][0].f_num);
        if(result2[0].f_point >= result3[0].required) {
            await pool.query("UPDATE userfam SET f_num = f_num + 1, f_point = 0 WHERE family_code = ?", result[0][0].family_code);
        }
        //이미지 불러와 이거 반환할거야
        let img;
        for(let i = 0; i < ranges.length; i++) {
            if(result2[0][0].f_point < ranges[i]*result3[0][0].required || point===standard) {
                img = images[i];
                break;
            }
        }
        const result4 = await pool.query(`SELECT ${img} FROM flower WHERE idx = ?`, result2[0][0].f_num);
        conn.release();
        return {changed_img: result4[0][0][img]};
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

export const getPoint = async(snsid) => {
    try {
        const conn = await pool.getConnection();
        const result = await conn.query("SELECT point FROM user WHERE snsId = ?", snsid);
        conn.release();
        return result[0][0];
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const getAll = async(snsId, flowerId) => {
    try {
        const conn = await pool.getConnection();
        const fam_name = await conn.query("SELECT fam_name FROM userfam JOIN user ON user.family_code = userfam.family_code WHERE snsId = ?", snsId);
        let result = await conn.query("SELECT idx, img_5 FROM flower WHERE idx < ?", flowerId);
        result = result.length > 0 ? result[0]:[];
        conn.release();
        return {family_name: fam_name[0], flowers: result};
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}