import SwaggerJsdoc from "swagger-jsdoc";

const options = {
    swaggerDefinition: {
        info: {
            version: "1.0.0",
            title: '안뜰 API Swagger',
            description: "안뜰 개발자용 스웨거 페이지입니다! 관련 문의는 백엔드 팀 아무에게나 하셔도 됩니당 다들 오늘도 홧팅:-)",
        },
        basepath: '/',
        servers: [{
            description:"안뜰 api",
            url: "http://umc-garden.store"
        }],
        securityDefinitions: {
            Authorization: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
            }
        }
    },
    apis: ['./src/**/*.js', './swagger/*']
};

export const specs = SwaggerJsdoc(options);
