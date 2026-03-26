import { Repository } from 'typeorm';
import { CommonWorkout, CommonWorkoutStatus } from '../entities/common-workout.entity';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { CommonWorkoutExercise } from '../entities/common-workout-exercise.entity';
import { CommonWorkoutParticipantSet } from '../entities/common-workout-participant-set.entity';
import { Workout } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';
import { CommonWorkoutsGateway } from './common-workouts.gateway';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { ConfirmCommonWorkoutSetDto } from './dto/confirm-common-workout-set.dto';
export declare class CommonWorkoutsService {
    private readonly commonWorkoutRepository;
    private readonly participantRepository;
    private readonly commonWorkoutExerciseRepository;
    private readonly participantSetRepository;
    private readonly workoutRepository;
    private readonly workoutExerciseRepository;
    private readonly workoutSetRepository;
    private readonly templateRepository;
    private readonly exerciseRepository;
    private readonly userRepository;
    private readonly gateway;
    constructor(commonWorkoutRepository: Repository<CommonWorkout>, participantRepository: Repository<CommonWorkoutParticipant>, commonWorkoutExerciseRepository: Repository<CommonWorkoutExercise>, participantSetRepository: Repository<CommonWorkoutParticipantSet>, workoutRepository: Repository<Workout>, workoutExerciseRepository: Repository<WorkoutExercise>, workoutSetRepository: Repository<WorkoutSet>, templateRepository: Repository<WorkoutTemplate>, exerciseRepository: Repository<Exercise>, userRepository: Repository<User>, gateway: CommonWorkoutsGateway);
    start(userId: number, dto: StartCommonWorkoutDto): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    getActive(userId: number): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    getByIdForUser(userId: number, commonWorkoutId: number): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    updateCommonWorkout(userId: number, commonWorkoutId: number, dto: UpdateCommonWorkoutDto): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    addExercise(userId: number, commonWorkoutId: number, dto: AddCommonWorkoutExerciseDto): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    changeExercisePosition(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number, dto: ChangeCommonWorkoutExercisePositionDto): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    changeExercise(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number, dto: ChangeCommonWorkoutExerciseDto): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    removeExercise(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    addSet(userId: number, commonWorkoutExerciseId: number): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    removeSet(userId: number, participantSetId: number): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    updateSet(userId: number, participantSetId: number, dto: UpdateCommonWorkoutSetDto): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    confirmSet(userId: number, participantSetId: number, dto: ConfirmCommonWorkoutSetDto): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    finish(userId: number, commonWorkoutId: number): Promise<{
        id: number;
        name: string;
        status: CommonWorkoutStatus;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        template: {
            id: number;
            name: string;
        };
        participants: {
            id: number;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
            setsCount: number;
            participants: {
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
                sets: {
                    id: number;
                    setNumber: number;
                    previousWeight: number;
                    previousReps: number;
                    currentWeight: number;
                    currentReps: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
            }[];
        }[];
    }>;
    private createCommonExercise;
    private createIndividualWorkoutFromCommonWorkout;
    private ensureUsersExist;
    private ensureParticipantsHaveNoActiveWorkouts;
    private getActiveCommonWorkoutEntityForUser;
    private getCommonWorkoutEntityForUser;
    private getCommonWorkoutExerciseFromWorkout;
    private getActiveCommonWorkoutExerciseForUser;
    private getParticipantSetForUser;
    private getPreviousSetForUserExerciseSetNumber;
    private getAccessibleExerciseForUsers;
    private calculateRepMax;
    private getDurationSeconds;
    private getDurationLabel;
    private mapCommonWorkout;
}
