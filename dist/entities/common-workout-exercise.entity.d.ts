import { CommonWorkout } from './common-workout.entity';
import { Exercise } from './exercise.entity';
import { CommonWorkoutParticipantSet } from './common-workout-participant-set.entity';
export declare class CommonWorkoutExercise {
    id: number;
    commonWorkoutId: number;
    commonWorkout: CommonWorkout;
    exerciseId: number;
    exercise: Exercise;
    order: number;
    participantSets: CommonWorkoutParticipantSet[];
}
