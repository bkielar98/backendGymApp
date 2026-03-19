import { Module } from '@nestjs/common';
import { GymGateway } from './gym.gateway';

@Module({
  providers: [GymGateway],
  exports: [GymGateway],
})
export class GymModule {}