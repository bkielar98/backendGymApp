import { WorkoutTemplate } from './workout-template.entity';
import { Exercise } from './exercise.entity';
export declare class WorkoutTemplateExercise {
    id: number;
    templateId: number;
    template: WorkoutTemplate;
    exerciseId: number;
    exercise: Exercise;
    order: number;
    setsCount: number;
}
