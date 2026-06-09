import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Friendship } from "../entities/friendship.entity";
import { User } from "../entities/user.entity";
import { UserBodyMeasurementEntry } from "../entities/user-body-measurement-entry.entity";
import { UserWeightEntry } from "../entities/user-weight-entry.entity";
import { Workout } from "../entities/workout.entity";
import { CommonWorkout } from "../entities/common-workout.entity";
import { CommonWorkoutParticipant } from "../entities/common-workout-participant.entity";
import { CommonWorkoutsModule } from "../common-workouts/common-workouts.module";
import { FriendsController } from "./friends.controller";
import { FriendsService } from "./friends.service";

@Module({
  imports: [
    CommonWorkoutsModule,
    TypeOrmModule.forFeature([
      Friendship,
      User,
      UserWeightEntry,
      UserBodyMeasurementEntry,
      Workout,
      CommonWorkout,
      CommonWorkoutParticipant,
    ]),
  ],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendsModule {}
