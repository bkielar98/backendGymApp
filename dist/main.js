"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
dotenv.config();
async function createDatabaseIfNotExists() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
    });
    const dbName = process.env.DB_NAME || 'gym_app';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();
}
async function bootstrap() {
    const usePostgres = Boolean(process.env.DATABASE_URL);
    if (!usePostgres) {
        await createDatabaseIfNotExists();
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Gym-Social API')
        .setDescription('API for Gym-Social MVP')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    app.enableCors();
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map