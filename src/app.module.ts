import { Module } from '@nestjs/common';
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
import * as dotenv from 'dotenv';

dotenv.config();
console.log(process.env)
@Module({
  imports: [
   TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username:  process.env.DB_USER,
  password:  process.env.DB_PASS,
  database:process.env.DB_DATABASE,
  synchronize: true
}),
    AuthModule,
    UsersModule,
    ExercisesModule,
    WorkoutTemplatesModule,
    GymsModule,
    MuscleStatusModule,
    WorkoutsModule,
    GymModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}