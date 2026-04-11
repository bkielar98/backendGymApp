export declare class CreateWorkoutTemplateExerciseDto {
    exerciseId: number;
    setsCount: number;
    order: number;
}
export declare class CreateWorkoutTemplateDto {
    name: string;
    description?: string;
    labels?: string[];
    startDate?: string;
    endDate?: string;
    tasks?: string[];
    memberUserIds?: number[];
    exercises: CreateWorkoutTemplateExerciseDto[];
}
