import SwaggerJsdoc from "swagger-jsdoc";

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "0.0.1",
            title: 'swagger-test',
            description: "swagger test",
        },
        basepath: '/',
        servers: [{
            description:"안뜰 api",
            url: "http://umc-garden.store"
        }]
    },
    apis: ["./swagger/*"],

};

export const specs = SwaggerJsdoc(options);
