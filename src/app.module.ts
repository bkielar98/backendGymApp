import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutTemplatesModule } from './workout-templates/workout-templates.module';
import { GymsModule } from './gyms/gyms.module';
import { MuscleStatusModule } from './muscle-status/muscle-status.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { GymModule } from './gym/gym.module';
import { SchemaFixService } from './database/schema-fix.service';
import { FriendsModule } from './friends/friends.module';
import { CommonWorkoutsModule } from './common-workouts/common-workouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      synchronize: true,
      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    UsersModule,
    ExercisesModule,
    WorkoutTemplatesModule,
    GymsModule,
    MuscleStatusModule,
    WorkoutsModule,
    GymModule,
    FriendsModule,
    CommonWorkoutsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SchemaFixService],
})
export class AppModule {}
