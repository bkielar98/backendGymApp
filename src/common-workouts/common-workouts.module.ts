import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommonWorkout } from '../entities/common-workout.entity';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { CommonWorkoutExercise } from '../entities/common-workout-exercise.entity';
import { CommonWorkoutParticipantSet } from '../entities/common-workout-participant-set.entity';
import { Workout } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';
import { UserExercisePersonalBest } from '../entities/user-exercise-personal-best.entity';
import { CommonWorkoutsController } from './common-workouts.controller';
import { CommonWorkoutsGateway } from './common-workouts.gateway';
import { CommonWorkoutsService } from './common-workouts.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      CommonWorkout,
      CommonWorkoutParticipant,
      CommonWorkoutExercise,
      CommonWorkoutParticipantSet,
      Workout,
      WorkoutExercise,
      WorkoutSet,
      WorkoutTemplate,
      Exercise,
      User,
      UserExercisePersonalBest,
    ]),
  ],
  providers: [CommonWorkoutsService, CommonWorkoutsGateway],
  controllers: [CommonWorkoutsController],
  exports: [CommonWorkoutsService],
})
export class CommonWorkoutsModule {}
