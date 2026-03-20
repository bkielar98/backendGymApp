import { Workout } from './workout.entity';
import { Exercise } from './exercise.entity';
import { WorkoutSet } from './workout-set.entity';
export declare class WorkoutExercise {
    id: number;
    workoutId: number;
    workout: Workout;
    exerciseId: number;
    exercise: Exercise;
    order: number;
    sets: WorkoutSet[];
}
