import { pool } from "../config/db.connect.js";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";


const ranges = [0.2, 0.4, 0.6, 0.8, 1];
const images = ['img_0', 'img_1', 'img_2', 'img_3', 'img_4', 'img_5'];


export const getOne = async(snsid) => {
    try{
        //const conn = await pool.getConnection();
        //꽃 이름, 포인트 가져와
        const result0 = await pool.query("SELECT family_code FROM user WHERE snsId = ?", snsid);
        if(result0[0][0].family_code==null) {
            return -1;
        }
        const fam = await pool.query("SELECT f_num, f_point FROM userfam WHERE family_code = ?", result0[0][0].family_code);
       
        //사진 가져와야 하니까 포인트 얼마나 필요한지 가져와
        const num = fam[0][0].f_num;
        const point = fam[0][0].f_point;
        const req = await pool.query("SELECT required FROM flower WHERE idx = ?", num);
       
        //이제 꽃 사진 가져오자 + 이름도 같이
        const standard = req[0][0].required;
        let img;
        if(point===standard) {
            img = images[5];
        } else {
            for(let i = 0; i < ranges.length; i++) {
                if(point < ranges[i]*standard) {
                    img = images[i];
                    break;
                }
            }
        }
        const result3 = await pool.query(`SELECT name, ${img} FROM flower WHERE idx IN (?, ?)`, [num,17]);
        //conn.release();
        //꽃 번호, 포인트, 이름, 그림
        return {idx: num, point: point, name: result3[0][0].name, img: result3[0][0][img], gauge: result3[0][1][img]};
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

export const cal_point = async(snsid) => {
    try {
        //const conn = await pool.getConnection();
        const point = await pool.query("SELECT point FROM user WHERE snsId = ?", snsid);
        console.log(point);
        if(point[0][0].point < 2)
            return -1;
        const currentPoint = point[0][0].point;
        console.log(currentPoint);
        await pool.query("UPDATE user SET point = point - 2 WHERE snsId = ?", snsid);
        //가족 꽃번호, 포인트, required 불러와서 f_point+2랑 비교한 뒤에 userfam 업데이트
        const result = await pool.query("SELECT family_code FROM user WHERE snsId = ?", snsid);
        console.log(result[0][0].family_code);
        if(result[0][0].family_code==null) {
            return -2;
        }
        const fam = await pool.query("SELECT f_num, f_point FROM userfam WHERE family_code = ?", result[0][0].family_code);
        const req = await pool.query("SELECT required FROM flower WHERE idx = ?", fam[0][0].f_num);
        console.log(fam[0][0].f_point+2);
        //포인트 다 채우면 꽃 바꾸고 포인트 0으로, 다 안 채웠으면 그냥 +2
        fam[0][0].f_point += 2;
        if(fam[0][0].f_point >= req[0][0].required) {
            //set f_num = f_num+1 있었던 것
            await pool.query("UPDATE userfam SET f_point = 0 WHERE family_code = ?", result[0][0].family_code);
        } else {
            await pool.query("UPDATE userfam SET f_point = f_point + 2 WHERE family_code = ?", result[0][0].family_code);
        }
        //이미지 불러와 이거 반환할거야
        let img;
        if(fam[0][0].f_point===req[0][0].required) {
            img = images[5];
        } else {
            for(let i = 0; i < ranges.length; i++) {
                if(fam[0][0].f_point < ranges[i]*req[0][0].required) {
                    img = images[i];
                    break;
                }
            }
        }
        console.log(img);
        const [result4] = await pool.query(`SELECT ${img} FROM flower WHERE idx IN (?,?)`, [fam[0][0].f_num, 17]);
        result4[1].gauge = result4[1][img];
        delete result4[1][img];
        //conn.release();
        return {point: currentPoint-2, changed_img: result4};
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}

export const getPoint = async(snsid) => {
    try {
        //const conn = await pool.getConnection();
        const result = await conn.query("SELECT point FROM user WHERE snsId = ?", snsid);
        //conn.release();
        return result[0][0];
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}


export const getAll = async(snsId, flowerId) => {
    try {
        //const conn = await pool.getConnection();
        const result0 = await pool.query("SELECT family_code FROM user WHERE snsId = ?", snsId);
        if(result0[0][0].family_code==null) {
            return -1;
        }
        const fam_name = await pool.query("SELECT fam_name FROM userfam WHERE family_code = ?", result0[0][0].family_code);
        let result = await pool.query("SELECT idx, img_5 FROM flower WHERE idx < ?", flowerId);
        result = result.length > 0 ? result[0]:[];
        //conn.release();
        return {family_name: fam_name[0], flowers: result};
    } catch(err) {
        console.error(err);
        throw new BaseError(status.PARAMETER_IS_WRONG, 'DB 쿼리 실행 중 에러 발생');
    }
}