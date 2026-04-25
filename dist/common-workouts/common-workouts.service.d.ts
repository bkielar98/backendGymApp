import { Repository } from 'typeorm';
import { CommonWorkout, CommonWorkoutStatus } from '../entities/common-workout.entity';
import { CommonWorkoutParticipant } from '../entities/common-workout-participant.entity';
import { CommonWorkoutExercise } from '../entities/common-workout-exercise.entity';
import { CommonWorkoutParticipantSet } from '../entities/common-workout-participant-set.entity';
import { Workout, WorkoutStatus } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/workout-set.entity';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { User } from '../entities/user.entity';
import { UserExercisePersonalBest } from '../entities/user-exercise-personal-best.entity';
import { CommonWorkoutsGateway } from './common-workouts.gateway';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { GetWorkoutDashboardStatsDto } from './dto/get-workout-dashboard-stats.dto';
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
    private readonly personalBestRepository;
    private readonly gateway;
    private readonly logger;
    constructor(commonWorkoutRepository: Repository<CommonWorkout>, participantRepository: Repository<CommonWorkoutParticipant>, commonWorkoutExerciseRepository: Repository<CommonWorkoutExercise>, participantSetRepository: Repository<CommonWorkoutParticipantSet>, workoutRepository: Repository<Workout>, workoutExerciseRepository: Repository<WorkoutExercise>, workoutSetRepository: Repository<WorkoutSet>, templateRepository: Repository<WorkoutTemplate>, exerciseRepository: Repository<Exercise>, userRepository: Repository<User>, personalBestRepository: Repository<UserExercisePersonalBest>, gateway: CommonWorkoutsGateway);
    start(userId: number, dto: StartCommonWorkoutDto): Promise<{
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
        status: CommonWorkoutStatus;
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
    getActive(userId: number): Promise<{
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
        status: CommonWorkoutStatus;
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
    finishActive(userId: number): Promise<{
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
        status: CommonWorkoutStatus;
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
    getByIdForUser(userId: number, commonWorkoutId: number): Promise<{
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
        status: CommonWorkoutStatus;
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
    getIndexForUser(userId: number, commonWorkoutId: number): Promise<{
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
        status: CommonWorkoutStatus;
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
    getHistoryForUser(userId: number): Promise<{
        id: number;
        name: string;
        status: WorkoutStatus;
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
    getHistoricalByIdForUser(userId: number, workoutId: number): Promise<{
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
        status: WorkoutStatus;
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
    getHistoricalSummaryForUser(userId: number, workoutId: number): Promise<{
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
        status: WorkoutStatus;
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
    updateHistoricalWorkout(userId: number, workoutId: number, dto: UpdateCommonWorkoutDto): Promise<{
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
        status: WorkoutStatus;
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
    removeHistoricalWorkout(userId: number, workoutId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getSummaryForUser(userId: number, workoutId: number): Promise<{
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
        status: CommonWorkoutStatus;
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
        status: WorkoutStatus;
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
    getExerciseHistoryForUser(userId: number, exerciseId: number): Promise<{
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
    getDashboardStatsForUser(userId: number, dto: GetWorkoutDashboardStatsDto): Promise<{
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
    getExerciseByIdForUser(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number): Promise<{
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
    updateCommonWorkout(userId: number, commonWorkoutId: number, dto: UpdateCommonWorkoutDto): Promise<{
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
            status: CommonWorkoutStatus;
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
    removeActiveWorkout(userId: number, commonWorkoutId: number): Promise<{
        success: boolean;
        discarded: boolean;
        workoutId: number;
    }>;
    addExercise(userId: number, commonWorkoutId: number, dto: AddCommonWorkoutExerciseDto): Promise<{
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
            status: CommonWorkoutStatus;
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
    changeExercisePosition(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number, dto: ChangeCommonWorkoutExercisePositionDto): Promise<{
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
            status: CommonWorkoutStatus;
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
    changeExercise(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number, dto: ChangeCommonWorkoutExerciseDto): Promise<{
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
            status: CommonWorkoutStatus;
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
    removeExercise(userId: number, commonWorkoutId: number, commonWorkoutExerciseId: number): Promise<{
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
            status: CommonWorkoutStatus;
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
    addSet(userId: number, commonWorkoutExerciseId: number): Promise<{
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
            status: CommonWorkoutStatus;
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
    removeSet(userId: number, participantSetId: number): Promise<{
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
            status: CommonWorkoutStatus;
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
    updateSet(userId: number, participantSetId: number, dto: UpdateCommonWorkoutSetDto): Promise<{
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
            status: CommonWorkoutStatus;
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
    finish(userId: number, commonWorkoutId: number): Promise<{
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
        status: CommonWorkoutStatus;
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
    private emitUpdatedIfSubscribed;
    private emitFinishedIfSubscribed;
    private emitDiscardedIfSubscribed;
    private logPayloadMetrics;
    private getWorkoutResponse;
    private getWorkoutExerciseResponse;
    private createCommonExercise;
    private createIndividualWorkoutFromCommonWorkout;
    private ensureUsersExist;
    private ensureParticipantsHaveNoActiveWorkouts;
    private ensureCommonWorkoutParticipantLimit;
    private ensureCommonWorkoutExerciseLimit;
    private ensureCommonWorkoutTotalSetsLimit;
    private getCommonWorkoutTotalSets;
    private getActiveCommonWorkoutEntityForUser;
    private getActiveCommonWorkoutStructureEntityForUser;
    private getCommonWorkoutEntityForUser;
    private getCommonWorkoutStructureEntityForUser;
    private getHistoricalWorkoutEntityForUser;
    private getCommonWorkoutExerciseFromWorkout;
    private getActiveCommonWorkoutExerciseForUser;
    private getCommonWorkoutExerciseEntityForUser;
    private getParticipantSetForUser;
    private getPreviousSetForUserExerciseSetNumber;
    private getPreviousSetsByUserIdForExercise;
    private getAccessibleExerciseForUsers;
    private getAccessibleWorkoutTemplateForUser;
    private syncPersonalBestForSavedWorkoutExercise;
    private calculateRepMax;
    private getDurationSeconds;
    private getDurationLabel;
    private mapWorkout;
    private mapWorkoutIndex;
    private mapWorkoutPerformanceSummary;
    private mapWorkoutSummary;
    private mapHistoricalWorkoutSummary;
    private mapHistoricalWorkoutPerformanceSummary;
    private mapHistoricalWorkout;
    private mapCommonWorkoutExerciseDetail;
    private mapWorkoutExerciseIndex;
    private mapCommonParticipantPerformance;
    private mapCommonExercisePerformance;
    private mapCommonParticipantExercisePerformance;
    private mapHistoricalExercisePerformance;
    private mapHistoricalParticipantExercisePerformance;
    private summarizeSetPerformance;
    private mapPerformanceSet;
    private getSetVolume;
    private mapHistoricalWorkoutUser;
    private mapExerciseSummary;
    private mapHistoricalWorkoutExercise;
    private mapParticipantSummary;
    private mapWorkoutExercise;
    private compareSetPerformance;
    private formatSetLabel;
    private toDateOnly;
    private getDateRange;
    private isDateInRange;
    private getFavoriteExerciseStat;
    private getFavoriteTrainingDay;
    private getFavoritePartnerStat;
    private findHistoricalBestForExercise;
}
