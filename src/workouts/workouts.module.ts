import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { Exercise } from '../entities/exercise.entity';
import { MuscleStatusModule } from '../muscle-status/muscle-status.module';
import { GymModule } from '../gym/gym.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise]), MuscleStatusModule, GymModule],
  providers: [WorkoutsService],
  controllers: [WorkoutsController],
})
export class WorkoutsModule {}