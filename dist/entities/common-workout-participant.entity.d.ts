import { User } from './user.entity';
import { CommonWorkout } from './common-workout.entity';
import { CommonWorkoutParticipantSet } from './common-workout-participant-set.entity';
export declare class CommonWorkoutParticipant {
    id: number;
    commonWorkoutId: number;
    commonWorkout: CommonWorkout;
    userId: number;
    user: User;
    sets: CommonWorkoutParticipantSet[];
}
