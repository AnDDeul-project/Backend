import SwaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        info: {
            title: '안뜰',
            version: '1.0.0',
            description: 'API 설명'
        },
        host: 'http://umc-garden.store/',
        basepath: '../'
    },
    apis: ['./src/**/*.js', './swagger/*']
};

export const specs = SwaggerJsdoc(options);
