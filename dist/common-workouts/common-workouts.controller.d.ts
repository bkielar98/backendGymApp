import { CommonWorkoutsService } from './common-workouts.service';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { ConfirmCommonWorkoutSetDto } from './dto/confirm-common-workout-set.dto';
export declare class CommonWorkoutsController {
    private readonly commonWorkoutsService;
    constructor(commonWorkoutsService: CommonWorkoutsService);
    start(req: any, dto: StartCommonWorkoutDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    getActive(req: any): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    findOne(req: any, id: number): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    update(req: any, id: number, dto: UpdateCommonWorkoutDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    addExercise(req: any, id: number, dto: AddCommonWorkoutExerciseDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    changeExercisePosition(req: any, id: number, exerciseId: number, dto: ChangeCommonWorkoutExercisePositionDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    changeExercise(req: any, id: number, exerciseId: number, dto: ChangeCommonWorkoutExerciseDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    removeExercise(req: any, id: number, exerciseId: number): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    addSet(req: any, exerciseId: number): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    removeSet(req: any, setId: number): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    updateSet(req: any, setId: number, dto: UpdateCommonWorkoutSetDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    confirmSet(req: any, setId: number, dto: ConfirmCommonWorkoutSetDto): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
    finish(req: any, id: number): Promise<{
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
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
}
