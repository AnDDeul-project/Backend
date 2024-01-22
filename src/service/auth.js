import jwt from "jsonwebtoken";
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";

export const verify = async(req, res, next) =>{
    try {
        const [authType, authToken] = req.headers.authorization.split(" ");
        req.decoded = jwt.verify(authToken, process.env.KAKAO_ID);
        return req.decoded.kakao_id;
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          throw new BaseError(status.TOKEN_IS_EXPIRED, error);
        }
        throw new BaseError(status.TOKEN_IS_INVALID, error);
      }
}