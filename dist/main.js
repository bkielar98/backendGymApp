"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const path_1 = require("path");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            const messages = flattenValidationErrors(errors);
            return new common_1.BadRequestException(messages);
        },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.use('/uploads', express.static((0, path_1.join)(process.cwd(), 'uploads')));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Gym API')
        .setDescription('API aplikacji treningowej')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    app.enableCors();
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, '0.0.0.0');
}
bootstrap();
function flattenValidationErrors(errors, parentPath = '') {
    return errors.flatMap((error) => {
        const path = parentPath
            ? /^\d+$/.test(error.property)
                ? `${parentPath}[${error.property}]`
                : `${parentPath}.${error.property}`
            : error.property;
        const ownMessages = error.constraints
            ? Object.values(error.constraints).map((message) => `${path}: ${message}`)
            : [];
        if (error.children?.length) {
            return [...ownMessages, ...flattenValidationErrors(error.children, path)];
        }
        if (ownMessages.length > 0) {
            return ownMessages;
        }
        return [`Pole ${path} zawiera nieprawidlowa wartosc.`];
    });
}
//# sourceMappingURL=main.js.map