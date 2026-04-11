export declare class UpdateWorkoutTemplateExerciseDto {
    id?: number;
    exerciseId: number;
    setsCount: number;
    order: number;
}
export declare class UpdateWorkoutTemplateDto {
    name?: string;
    description?: string;
    labels?: string[];
    startDate?: string | null;
    endDate?: string | null;
    tasks?: string[];
    memberUserIds?: number[];
    exercises?: UpdateWorkoutTemplateExerciseDto[];
}
