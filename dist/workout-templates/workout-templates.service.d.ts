import { Repository } from 'typeorm';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { WorkoutTemplateExercise } from '../entities/workout-template-exercise.entity';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { AddWorkoutTemplateExerciseDto } from './dto/add-workout-template-exercise.dto';
export declare class WorkoutTemplatesService {
    private readonly templateRepository;
    private readonly templateExerciseRepository;
    private readonly exerciseRepository;
    constructor(templateRepository: Repository<WorkoutTemplate>, templateExerciseRepository: Repository<WorkoutTemplateExercise>, exerciseRepository: Repository<Exercise>);
    create(userId: number, createDto: CreateWorkoutTemplateDto): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    findAll(userId: number): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }[]>;
    findOne(userId: number, id: number): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    update(userId: number, id: number, updateDto: UpdateWorkoutTemplateDto): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    addExercises(userId: number, templateId: number, dtos: AddWorkoutTemplateExerciseDto[]): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    changeExercisePosition(userId: number, templateId: number, templateExerciseId: number, order: number): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    changeExercise(userId: number, templateId: number, templateExerciseId: number, exerciseId: number): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    changeExerciseSetsCount(userId: number, templateId: number, templateExerciseId: number, setsCount: number): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    removeExercise(userId: number, templateId: number, templateExerciseId: number): Promise<{
        id: number;
        name: string;
        exercises: {
            id: number;
            exerciseId: number;
            order: number;
            setsCount: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
    }>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    private getTemplateEntityForUser;
    private getTemplateExerciseForTemplate;
    private mapTemplate;
    private validateTemplateExercises;
}
