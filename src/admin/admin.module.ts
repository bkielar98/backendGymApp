import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommonWorkoutsModule } from '../common-workouts/common-workouts.module';
import { UsersModule } from '../users/users.module';
import { CommonWorkout } from '../entities/common-workout.entity';
import { User } from '../entities/user.entity';
import { Workout } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { Exercise } from '../entities/exercise.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    AuthModule,
    CommonWorkoutsModule,
    UsersModule,
    TypeOrmModule.forFeature([
      User,
      Workout,
      CommonWorkout,
      WorkoutExercise,
      WorkoutSet,
      Exercise,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
