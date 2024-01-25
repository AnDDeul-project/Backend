import express from 'express';
import { specs } from './swagger/swagger.config.js';
import SwaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import cors from 'cors';
import {healthRoute} from './src/routes/health.route.js'
import { response } from './src/config/response.js';
import { BaseError } from './src/config/error.js';
import { status } from './src/config/response.status.js';
import { kakaoRouter } from './src/routes/kakao.route.js';
import { randomRoute } from './src/routes/random.route.js';
dotenv.config();    // .env 파일 사용 (환경 변수 관리)


const app = express();
// server setting - veiw, static, body-parser etc..
app.set('port', process.env.PORT || 3000)   // 서버 포트 지정
app.use(cors());
app.use('/health', healthRoute);                            // cors 방식 허용
app.use(express.static('public'));          // 정적 파일 접근
app.use(express.json());                    // request의 본문을 json으로 해석할 수 있도록 함 (JSON 형태의 요청 body를 파싱하기 위함)
app.use(express.urlencoded({extended: false})); // 단순 객체 문자열 형태로 본문 데이터 해석
app.use('/auth', kakaoRouter);
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));
app.use('/random', randomRoute);
/*
 @swagger
 /api/example:
    get:
      description: Example endpoint
      responses:
        200:
          description: Successful response
 */
app.get('/', (req, res, next) => {
    res.send(response(status.SUCCESS, "루트 페이지!"));
})

// error handling
app.use((req, res, next) => {
    const err = new BaseError(status.NOT_FOUND);
    next(err);
});

app.use((err, req, res, next) => {
    // 템플릿 엔진 변수 설정
    res.locals.message = err.message;   
    // 개발환경이면 에러를 출력하고 아니면 출력하지 않기
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; 
    console.error(err);
});

app.listen(app.get('port'), () => {
    console.log(`Example app listening on port ${app.get('port')}`);
});
