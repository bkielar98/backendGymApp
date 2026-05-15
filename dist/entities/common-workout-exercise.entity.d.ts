import { CommonWorkout } from './common-workout.entity';
import { CommonWorkoutParticipant } from './common-workout-participant.entity';
import { Exercise } from './exercise.entity';
import { CommonWorkoutParticipantSet } from './common-workout-participant-set.entity';
import { CommonWorkoutBlock } from './common-workout-block.entity';
export declare class CommonWorkoutExercise {
    id: number;
    commonWorkoutId: number;
    commonWorkout: CommonWorkout;
    participantId: number | null;
    participant: CommonWorkoutParticipant | null;
    blockId: number | null;
    block: CommonWorkoutBlock | null;
    exerciseId: number | null;
    exercise: Exercise | null;
    order: number;
    completed: boolean;
    completedAt: Date | null;
    participantSets: CommonWorkoutParticipantSet[];
}
