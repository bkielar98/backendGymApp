import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SchemaFixService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchemaFixService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.ensureUserCardSchema();
    await this.ensureFriendshipSchema();
    await this.ensureCommonWorkoutSchema();
    await this.ensureWorkoutAnalyticsSchema();
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
        "neck" double precision NULL,
        "shoulders" double precision NULL,
        "chest" double precision NULL,
        "leftBiceps" double precision NULL,
        "rightBiceps" double precision NULL,
        "leftForearm" double precision NULL,
        "rightForearm" double precision NULL,
        "upperAbs" double precision NULL,
        "waist" double precision NULL,
        "lowerAbs" double precision NULL,
        "hips" double precision NULL,
        "leftThigh" double precision NULL,
        "rightThigh" double precision NULL,
        "leftCalf" double precision NULL,
        "rightCalf" double precision NULL,
        "userId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_user_body_measurement_entry_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    const nullableMeasurementColumns = [
      'neck',
      'shoulders',
      'chest',
      'leftBiceps',
      'rightBiceps',
      'leftForearm',
      'rightForearm',
      'upperAbs',
      'waist',
      'lowerAbs',
      'hips',
      'leftThigh',
      'rightThigh',
      'leftCalf',
      'rightCalf',
    ];

    for (const column of nullableMeasurementColumns) {
      await this.dataSource.query(
        `ALTER TABLE "user_body_measurement_entry" ALTER COLUMN "${column}" DROP NOT NULL`,
      );
    }

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

  private async ensureCommonWorkoutSchema() {
    await this.dataSource.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'common_workout_status_enum') THEN
          CREATE TYPE "common_workout_status_enum" AS ENUM ('active', 'completed');
        END IF;
      END$$;
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "common_workout" (
        "id" SERIAL PRIMARY KEY,
        "createdByUserId" integer NOT NULL,
        "templateId" integer NULL,
        "name" character varying NOT NULL,
        "status" "common_workout_status_enum" NOT NULL DEFAULT 'active',
        "startedAt" TIMESTAMP NOT NULL,
        "finishedAt" TIMESTAMP NULL,
        CONSTRAINT "FK_common_workout_creator" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_common_workout_template" FOREIGN KEY ("templateId") REFERENCES "workout_template"("id") ON DELETE SET NULL
      )
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "common_workout_participant" (
        "id" SERIAL PRIMARY KEY,
        "commonWorkoutId" integer NOT NULL,
        "userId" integer NOT NULL,
        CONSTRAINT "FK_common_workout_participant_workout" FOREIGN KEY ("commonWorkoutId") REFERENCES "common_workout"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_common_workout_participant_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "common_workout_exercise" (
        "id" SERIAL PRIMARY KEY,
        "commonWorkoutId" integer NOT NULL,
        "exerciseId" integer NOT NULL,
        "order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "FK_common_workout_exercise_workout" FOREIGN KEY ("commonWorkoutId") REFERENCES "common_workout"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_common_workout_exercise_exercise" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE CASCADE
      )
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "common_workout_participant_set" (
        "id" SERIAL PRIMARY KEY,
        "participantId" integer NOT NULL,
        "commonWorkoutExerciseId" integer NOT NULL,
        "setNumber" integer NOT NULL,
        "previousWeight" double precision NULL,
        "previousReps" integer NULL,
        "currentWeight" double precision NULL,
        "currentReps" integer NULL,
        "repMax" double precision NULL,
        "confirmed" boolean NOT NULL DEFAULT false,
        CONSTRAINT "FK_common_workout_set_participant" FOREIGN KEY ("participantId") REFERENCES "common_workout_participant"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_common_workout_set_exercise" FOREIGN KEY ("commonWorkoutExerciseId") REFERENCES "common_workout_exercise"("id") ON DELETE CASCADE
      )
    `);

    this.logger.log('Common workout schema verified');
  }

  private async ensureWorkoutAnalyticsSchema() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "user_exercise_personal_best" (
        "id" SERIAL PRIMARY KEY,
        "userId" integer NOT NULL,
        "exerciseId" integer NOT NULL,
        "workoutId" integer NULL,
        "weight" double precision NOT NULL,
        "reps" integer NOT NULL,
        "repMax" double precision NOT NULL,
        "achievedAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_user_exercise_personal_best_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_exercise_personal_best_exercise" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_exercise_personal_best_workout" FOREIGN KEY ("workoutId") REFERENCES "workout"("id") ON DELETE SET NULL
      )
    `);

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_exercise_personal_best_user_exercise"
      ON "user_exercise_personal_best" ("userId", "exerciseId")
    `);

    this.logger.log('Workout analytics schema verified');
  }
}
