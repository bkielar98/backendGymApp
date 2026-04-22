import { CommonWorkoutsService } from './common-workouts.service';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { ConfirmCommonWorkoutSetDto } from './dto/confirm-common-workout-set.dto';
import { GetWorkoutDashboardStatsDto } from './dto/get-workout-dashboard-stats.dto';
export declare class CommonWorkoutsController {
    private readonly commonWorkoutsService;
    constructor(commonWorkoutsService: CommonWorkoutsService);
    start(req: any, dto: StartCommonWorkoutDto): Promise<{
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
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    getActive(req: any): Promise<{
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
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    getDashboardStats(req: any, dto: GetWorkoutDashboardStatsDto): Promise<{
        dateFrom: string;
        dateTo: string;
        workoutsCount: number;
        favoriteExercise: {
            exercise: {
                id: number;
                name: string;
            };
            workoutsCount: number;
            setsCount: number;
            personalRecord: {
                weight: number;
                reps: number;
                repMax: number;
                achievedAt: Date;
            };
        };
        favoriteTrainingDay: {
            day: string;
            workoutsCount: number;
        };
        favoriteTrainingPartner: {
            user: {
                id: number;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
            workoutsCount: number;
        };
    }>;
    getExerciseHistory(req: any, exerciseId: number): Promise<{
        exercise: {
            id: number;
            name: string;
        };
        history: {
            workoutId: number;
            workoutName: string;
            exerciseName: string;
            date: string;
            sets: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                repMax: number;
                confirmed: boolean;
                label: string;
            }[];
        }[];
    }>;
    findHistory(req: any): Promise<{
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }[]>;
    findHistorySummary(req: any, historyId: number): Promise<{
        participants: {
            exercises: {
                sets: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
                totalSets: number;
                confirmedSets: number;
                totalWeight: number;
                totalReps: number;
                totalVolume: number;
                liftedWeight: number;
                bestSet: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                };
                workoutExerciseId: number;
                order: number;
                exercise: {
                    id: number;
                    name: string;
                    description: string;
                    muscleGroups: string[];
                };
            }[];
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                volume: number;
                repMax: number;
                confirmed: boolean;
            };
            participantId: any;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            participants: {
                sets: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
                totalSets: number;
                confirmedSets: number;
                totalWeight: number;
                totalReps: number;
                totalVolume: number;
                liftedWeight: number;
                bestSet: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                };
                participantId: any;
                user: unknown;
            }[];
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                volume: number;
                repMax: number;
                confirmed: boolean;
            };
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
        totalSets: number;
        confirmedSets: number;
        totalWeight: number;
        totalReps: number;
        totalVolume: number;
        liftedWeight: number;
        bestSet: {
            id: number;
            setNumber: number;
            weight: number;
            reps: number;
            volume: number;
            repMax: number;
            confirmed: boolean;
        };
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    findHistoryOne(req: any, historyId: number): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
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
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    updateHistory(req: any, historyId: number, dto: UpdateCommonWorkoutDto): Promise<{
        exercises: {
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
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
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    removeHistory(req: any, historyId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    findSummary(req: any, id: number): Promise<{
        source: string;
        participants: {
            exercises: {
                sets: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
                totalSets: number;
                confirmedSets: number;
                totalWeight: number;
                totalReps: number;
                totalVolume: number;
                liftedWeight: number;
                bestSet: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                };
                workoutExerciseId: number;
                order: number;
                exercise: {
                    id: number;
                    name: string;
                    description: string;
                    muscleGroups: string[];
                };
            }[];
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                volume: number;
                repMax: number;
                confirmed: boolean;
            };
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
            participants: {
                sets: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
                totalSets: number;
                confirmedSets: number;
                totalWeight: number;
                totalReps: number;
                totalVolume: number;
                liftedWeight: number;
                bestSet: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                };
                participantId: number;
                user: {
                    id: number;
                    email: string;
                    name: string;
                    avatarPath: string;
                    avatarUrl: string;
                };
            }[];
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                volume: number;
                repMax: number;
                confirmed: boolean;
            };
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
        totalSets: number;
        confirmedSets: number;
        totalWeight: number;
        totalReps: number;
        totalVolume: number;
        liftedWeight: number;
        bestSet: {
            id: number;
            setNumber: number;
            weight: number;
            reps: number;
            volume: number;
            repMax: number;
            confirmed: boolean;
        };
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    } | {
        source: string;
        participants: {
            exercises: {
                sets: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
                totalSets: number;
                confirmedSets: number;
                totalWeight: number;
                totalReps: number;
                totalVolume: number;
                liftedWeight: number;
                bestSet: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                };
                workoutExerciseId: number;
                order: number;
                exercise: {
                    id: number;
                    name: string;
                    description: string;
                    muscleGroups: string[];
                };
            }[];
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                volume: number;
                repMax: number;
                confirmed: boolean;
            };
            participantId: any;
            user: {
                id: number;
                email: string;
                name: string;
                avatarPath: string;
                avatarUrl: string;
            };
        }[];
        exercises: {
            participants: {
                sets: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                }[];
                totalSets: number;
                confirmedSets: number;
                totalWeight: number;
                totalReps: number;
                totalVolume: number;
                liftedWeight: number;
                bestSet: {
                    id: number;
                    setNumber: number;
                    weight: number;
                    reps: number;
                    volume: number;
                    repMax: number;
                    confirmed: boolean;
                };
                participantId: any;
                user: unknown;
            }[];
            totalSets: number;
            confirmedSets: number;
            totalWeight: number;
            totalReps: number;
            totalVolume: number;
            liftedWeight: number;
            bestSet: {
                id: number;
                setNumber: number;
                weight: number;
                reps: number;
                volume: number;
                repMax: number;
                confirmed: boolean;
            };
            id: number;
            order: number;
            exercise: {
                id: number;
                name: string;
                description: string;
                muscleGroups: string[];
            };
        }[];
        totalSets: number;
        confirmedSets: number;
        totalWeight: number;
        totalReps: number;
        totalVolume: number;
        liftedWeight: number;
        bestSet: {
            id: number;
            setNumber: number;
            weight: number;
            reps: number;
            volume: number;
            repMax: number;
            confirmed: boolean;
        };
        id: number;
        name: string;
        status: import("../entities/workout.entity").WorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    findIndex(req: any, id: number): Promise<{
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
            confirmedSets: number;
        }[];
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    findExercise(req: any, id: number, exerciseId: number): Promise<{
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
    }>;
    findOne(req: any, id: number): Promise<{
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
            confirmedSets: number;
        }[];
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
    update(req: any, id: number, dto: UpdateCommonWorkoutDto): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
    }>;
    addExercise(req: any, id: number, dto: AddCommonWorkoutExerciseDto): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
        exercise: {
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
        };
    }>;
    changeExercisePosition(req: any, id: number, exerciseId: number, dto: ChangeCommonWorkoutExercisePositionDto): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
    }>;
    changeExercise(req: any, id: number, exerciseId: number, dto: ChangeCommonWorkoutExerciseDto): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
        exercise: {
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
        };
    }>;
    removeExercise(req: any, id: number, exerciseId: number): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
    }>;
    addSet(req: any, exerciseId: number): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
        exercise: {
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
        };
    }>;
    removeSet(req: any, setId: number): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
        exercise: {
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
        };
    }>;
    updateSet(req: any, setId: number, dto: UpdateCommonWorkoutSetDto): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
        exercise: {
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
        };
    }>;
    confirmSet(req: any, setId: number, dto: ConfirmCommonWorkoutSetDto): Promise<{
        workout: {
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
                confirmedSets: number;
            }[];
            id: number;
            name: string;
            status: import("../entities/common-workout.entity").CommonWorkoutStatus;
            mode: string;
            isSolo: boolean;
            participantCount: number;
            startedAt: Date;
            finishedAt: Date;
            durationSeconds: number;
            durationLabel: string;
            exerciseCount: number;
            totalSets: number;
            confirmedSets: number;
            exerciseNames: string[];
            template: {
                id: number;
                name: string;
            };
        };
        exercise: {
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
        };
    }>;
    finish(req: any, id: number): Promise<{
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
        id: number;
        name: string;
        status: import("../entities/common-workout.entity").CommonWorkoutStatus;
        mode: string;
        isSolo: boolean;
        participantCount: number;
        startedAt: Date;
        finishedAt: Date;
        durationSeconds: number;
        durationLabel: string;
        exerciseCount: number;
        totalSets: number;
        confirmedSets: number;
        exerciseNames: string[];
        template: {
            id: number;
            name: string;
        };
    }>;
}
