import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymsService } from './gyms.service';
import { GymsController } from './gyms.controller';
import { Gym } from '../entities/gym.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gym])],
  providers: [GymsService],
  controllers: [GymsController],
})
export class GymsModule {}