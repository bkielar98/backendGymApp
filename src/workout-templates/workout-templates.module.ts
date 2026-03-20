import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutTemplatesService } from './workout-templates.service';
import { WorkoutTemplatesController } from './workout-templates.controller';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { WorkoutTemplateExercise } from '../entities/workout-template-exercise.entity';
import { Exercise } from '../entities/exercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutTemplate, WorkoutTemplateExercise, Exercise])],
  providers: [WorkoutTemplatesService],
  controllers: [WorkoutTemplatesController],
})
export class WorkoutTemplatesModule {}