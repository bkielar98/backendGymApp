import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SchemaFixService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchemaFixService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.ensureUserCardSchema();
    await this.ensureFriendshipSchema();
  }

  private async ensureUserCardSchema() {
    await this.dataSource.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "avatarPath" character varying',
    );
    await this.dataSource.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "refreshTokenHash" character varying',
    );

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "user_weight_entry" (
        "id" SERIAL PRIMARY KEY,
        "recordedOn" date NOT NULL,
        "weight" double precision NOT NULL,
        "userId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_user_weight_entry_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "user_body_measurement_entry" (
        "id" SERIAL PRIMARY KEY,
        "recordedOn" date NOT NULL,
        "neck" double precision NOT NULL,
        "shoulders" double precision NOT NULL,
        "chest" double precision NOT NULL,
        "leftBiceps" double precision NOT NULL,
        "rightBiceps" double precision NOT NULL,
        "leftForearm" double precision NOT NULL,
        "rightForearm" double precision NOT NULL,
        "upperAbs" double precision NOT NULL,
        "waist" double precision NOT NULL,
        "lowerAbs" double precision NOT NULL,
        "hips" double precision NOT NULL,
        "leftThigh" double precision NOT NULL,
        "rightThigh" double precision NOT NULL,
        "leftCalf" double precision NOT NULL,
        "rightCalf" double precision NOT NULL,
        "userId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_user_body_measurement_entry_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    this.logger.log('User card schema verified');
  }

  private async ensureFriendshipSchema() {
    await this.dataSource.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'friendship_status_enum') THEN
          CREATE TYPE "friendship_status_enum" AS ENUM ('pending', 'accepted', 'rejected');
        END IF;
      END$$;
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "friendship" (
        "id" SERIAL PRIMARY KEY,
        "requesterUserId" integer NOT NULL,
        "receiverUserId" integer NOT NULL,
        "status" "friendship_status_enum" NOT NULL DEFAULT 'pending',
        "respondedAt" TIMESTAMP NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_friendship_requester" FOREIGN KEY ("requesterUserId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_friendship_receiver" FOREIGN KEY ("receiverUserId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS "IDX_friendship_requester" ON "friendship" ("requesterUserId")
    `);
    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS "IDX_friendship_receiver" ON "friendship" ("receiverUserId")
    `);

    this.logger.log('Friendship schema verified');
  }
}
