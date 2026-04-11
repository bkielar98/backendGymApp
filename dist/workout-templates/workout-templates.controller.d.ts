import { AddWorkoutTemplateExerciseDto } from './dto/add-workout-template-exercise.dto';
import { ChangeWorkoutTemplateExercisePositionDto } from './dto/change-workout-template-exercise-position.dto';
import { ChangeWorkoutTemplateExerciseSetsDto } from './dto/change-workout-template-exercise-sets.dto';
import { ChangeWorkoutTemplateExerciseDto } from './dto/change-workout-template-exercise.dto';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { ShareWorkoutTemplateDto } from './dto/share-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { UpdateWorkoutTemplateMembersDto } from './dto/update-workout-template-members.dto';
import { WorkoutTemplatesService } from './workout-templates.service';
export declare class WorkoutTemplatesController {
    private readonly workoutTemplatesService;
    constructor(workoutTemplatesService: WorkoutTemplatesService);
    create(req: any, createDto: CreateWorkoutTemplateDto): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    findAll(req: any): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    findSharedWithMe(req: any): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    findSharedByCode(req: any, shareCode: string): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    findOne(req: any, id: number): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    update(req: any, id: number, updateDto: UpdateWorkoutTemplateDto): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    patch(req: any, id: number, updateDto: UpdateWorkoutTemplateDto): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    updateMembers(req: any, id: number, dto: UpdateWorkoutTemplateMembersDto): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    share(req: any, id: number, dto: ShareWorkoutTemplateDto): Promise<{
        shareCode: string;
        shareUrl: string;
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    addExercise(req: any, id: number, dto: AddWorkoutTemplateExerciseDto[]): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    changeExercisePosition(req: any, id: number, exerciseEntryId: number, dto: ChangeWorkoutTemplateExercisePositionDto): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    changeExercise(req: any, id: number, exerciseEntryId: number, dto: ChangeWorkoutTemplateExerciseDto): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    changeExerciseSetsCount(req: any, id: number, exerciseEntryId: number, dto: ChangeWorkoutTemplateExerciseSetsDto): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    removeExercise(req: any, id: number, exerciseEntryId: number): Promise<{
        id: number;
        name: string;
        description: string;
        labels: string[];
        startDate: Date;
        endDate: Date;
        tasks: string[];
        isShared: boolean;
        shareCode: string;
        access: string;
        owner: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        };
        members: {
            id: number;
            name: string;
            email: string;
            avatarPath: string;
        }[];
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
    remove(req: any, id: number): Promise<{
        message: string;
    }>;
}
