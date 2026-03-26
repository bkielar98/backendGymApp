import { CommonWorkoutParticipant } from './common-workout-participant.entity';
import { CommonWorkoutExercise } from './common-workout-exercise.entity';
export declare class CommonWorkoutParticipantSet {
    id: number;
    participantId: number;
    participant: CommonWorkoutParticipant;
    commonWorkoutExerciseId: number;
    commonWorkoutExercise: CommonWorkoutExercise;
    setNumber: number;
    previousWeight: number | null;
    previousReps: number | null;
    currentWeight: number | null;
    currentReps: number | null;
    repMax: number | null;
    confirmed: boolean;
}
