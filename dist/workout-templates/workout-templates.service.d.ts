import { Repository } from 'typeorm';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { WorkoutTemplateExercise } from '../entities/workout-template-exercise.entity';
import { WorkoutTemplateMember } from '../entities/workout-template-member.entity';
import { Friendship } from '../entities/friendship.entity';
import { User } from '../entities/user.entity';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { AddWorkoutTemplateExerciseDto } from './dto/add-workout-template-exercise.dto';
export declare class WorkoutTemplatesService {
    private readonly templateRepository;
    private readonly templateExerciseRepository;
    private readonly templateMemberRepository;
    private readonly exerciseRepository;
    private readonly friendshipRepository;
    private readonly userRepository;
    constructor(templateRepository: Repository<WorkoutTemplate>, templateExerciseRepository: Repository<WorkoutTemplateExercise>, templateMemberRepository: Repository<WorkoutTemplateMember>, exerciseRepository: Repository<Exercise>, friendshipRepository: Repository<Friendship>, userRepository: Repository<User>);
    create(userId: number, createDto: CreateWorkoutTemplateDto): Promise<{
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
    findAll(userId: number): Promise<{
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
    findSharedWithMe(userId: number): Promise<{
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
    findSharedByCode(userId: number, shareCode: string): Promise<{
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
    findOne(userId: number, id: number): Promise<{
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
    update(userId: number, id: number, updateDto: UpdateWorkoutTemplateDto): Promise<{
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
    updateMembers(userId: number, templateId: number, memberUserIds: number[]): Promise<{
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
    share(userId: number, templateId: number, memberUserIds: number[]): Promise<{
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
    addExercises(userId: number, templateId: number, dtos: AddWorkoutTemplateExerciseDto[]): Promise<{
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
    changeExercisePosition(userId: number, templateId: number, templateExerciseId: number, order: number): Promise<{
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
    changeExercise(userId: number, templateId: number, templateExerciseId: number, exerciseId: number): Promise<{
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
    changeExerciseSetsCount(userId: number, templateId: number, templateExerciseId: number, setsCount: number): Promise<{
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
    removeExercise(userId: number, templateId: number, templateExerciseId: number): Promise<{
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
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    private getTemplateEntityForUser;
    private getTemplateAccessibleToUser;
    private getTemplatesAccessibleToUser;
    private getTemplateExerciseForTemplate;
    private mapTemplate;
    private validateTemplateExercises;
    private validateTemplateMetadata;
    private ensureExerciseLimit;
    private ensureTotalSetsLimit;
    private normalizeLabels;
    private normalizeTasks;
    private normalizeDate;
    private syncMembers;
}
