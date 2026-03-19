import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';

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
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Gym-Social API')
    .setDescription('API for Gym-Social MVP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors();
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();