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
import { User } from './entities/user.entity';
import { Exercise } from './entities/exercise.entity';
import { WorkoutTemplate } from './entities/workout-template.entity';
import { Gym } from './entities/gym.entity';
import { MuscleStatus } from './entities/muscle-status.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'gym_app',
      entities: [User, Exercise, WorkoutTemplate, Gym, MuscleStatus],
      synchronize: true,
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