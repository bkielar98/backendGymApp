export declare class UpdateWorkoutTemplateExerciseDto {
    id?: number;
    exerciseId: number;
    setsCount: number;
    order: number;
}
export declare class UpdateWorkoutTemplateDto {
    name?: string;
    exercises?: UpdateWorkoutTemplateExerciseDto[];
}
