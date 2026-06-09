import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { User } from '../entities/user.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { PaginatedTextSearchQueryDto } from '../common/dto/paginated-text-search-query.dto';
export declare class ExercisesService {
    private exerciseRepository;
    private workoutExerciseRepository;
    private readonly defaultPage;
    private readonly defaultLimit;
    private readonly maxLimit;
    constructor(exerciseRepository: Repository<Exercise>, workoutExerciseRepository: Repository<WorkoutExercise>);
    create(user: User, createExerciseDto: CreateExerciseDto): Promise<Exercise>;
    findAll(user: User, query?: PaginatedTextSearchQueryDto): Promise<{
        exercises: Exercise[];
        total: number;
        page: number;
        limit: number;
    }>;
    findCustom(user: User): Promise<Exercise[]>;
    findOne(user: User, id: number): Promise<Exercise>;
    findHistory(user: User, id: number, query?: PaginatedTextSearchQueryDto): Promise<{
        exercise: {
            id: number;
            name: string;
        };
        history: {
            date: string;
            sets: Array<{
                id: number;
                setNumber: number;
                previousWeight: number | null;
                previousReps: number | null;
                currentWeight: number | null;
                currentReps: number | null;
                repMax: number | null;
                confirmed: boolean;
            }>;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(user: User, id: number, updateExerciseDto: UpdateExerciseDto): Promise<Exercise>;
    remove(user: User, id: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        name: string;
    }>;
    private ensureUserCanAccessExercise;
    private ensureUserCanManageExercise;
    private toDateKey;
    private normalizePage;
    private normalizeLimit;
    private normalizeSearch;
}
