import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { UserBodyMeasurementEntry } from '../entities/user-body-measurement-entry.entity';
import { UserWeightEntry } from '../entities/user-weight-entry.entity';
import { Workout } from '../entities/workout.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Friendship,
      User,
      UserWeightEntry,
      UserBodyMeasurementEntry,
      Workout,
    ]),
  ],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
