export declare class CreateWorkoutTemplateExerciseDto {
    exerciseId: number;
    setsCount: number;
    order: number;
}
export declare class CreateWorkoutTemplateDto {
    name: string;
    exercises: CreateWorkoutTemplateExerciseDto[];
}
