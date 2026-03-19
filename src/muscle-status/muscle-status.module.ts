import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuscleStatusService } from './muscle-status.service';
import { MuscleStatusController } from './muscle-status.controller';
import { MuscleStatus } from '../entities/muscle-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MuscleStatus])],
  providers: [MuscleStatusService],
  controllers: [MuscleStatusController],
  exports: [MuscleStatusService],
})
export class MuscleStatusModule {}