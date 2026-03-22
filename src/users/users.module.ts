import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { UserWeightEntry } from '../entities/user-weight-entry.entity';
import { UserBodyMeasurementEntry } from '../entities/user-body-measurement-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserWeightEntry, UserBodyMeasurementEntry]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
