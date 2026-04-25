import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { LoopProtectionInterceptor } from './common/interceptors/loop-protection.interceptor';
import { AdminModule } from './admin/admin.module';

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
      extra: {
        max: Number(process.env.DB_POOL_MAX ?? 1),
      },
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
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SchemaFixService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoopProtectionInterceptor,
    },
  ],
})
export class AppModule {}
