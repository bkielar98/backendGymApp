import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutTemplatesService } from './workout-templates.service';
import { WorkoutTemplatesController } from './workout-templates.controller';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { WorkoutTemplateExercise } from '../entities/workout-template-exercise.entity';
import { Exercise } from '../entities/exercise.entity';
import { WorkoutTemplateMember } from '../entities/workout-template-member.entity';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkoutTemplate,
      WorkoutTemplateExercise,
      WorkoutTemplateMember,
      Exercise,
      Friendship,
      User,
    ]),
  ],
  providers: [WorkoutTemplatesService],
  controllers: [WorkoutTemplatesController],
})
export class WorkoutTemplatesModule {}
