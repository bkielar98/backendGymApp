import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship, User])],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
