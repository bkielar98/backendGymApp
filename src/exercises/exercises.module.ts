import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { Exercise } from '../entities/exercise.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, WorkoutExercise])],
  providers: [ExercisesService],
  controllers: [ExercisesController],
})
export class ExercisesModule {}
