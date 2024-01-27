import jwt from "jsonwebtoken";

export const verify = async(req, res, next) =>{
    try {
        const [authType, authToken] = req.headers.authorization.split(" ");
        console.log(authToken);
      
        req.decoded = jwt.verify(authToken, process.env.KAKAO_ID);
        return req.decoded.kakao_id;
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(419).json({ code: 419, message: "토큰 만료" });
        }
        return res.status(401).json({ code: 401, message: "유효하지 않은 토큰" });
      }
}