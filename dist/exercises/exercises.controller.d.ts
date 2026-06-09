import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';
import { PaginatedTextSearchQueryDto } from '../common/dto/paginated-text-search-query.dto';
export declare class ExercisesController {
    private exercisesService;
    constructor(exercisesService: ExercisesService);
    create(req: any, createExerciseDto: CreateExerciseDto): Promise<import("../entities/exercise.entity").Exercise>;
    findAll(req: any, query?: PaginatedTextSearchQueryDto): Promise<{
        exercises: import("../entities/exercise.entity").Exercise[];
        total: number;
        page: number;
        limit: number;
    }>;
    findCustom(req: any): Promise<import("../entities/exercise.entity").Exercise[]>;
    findHistory(req: any, id: string, query?: PaginatedTextSearchQueryDto): Promise<{
        exercise: {
            id: number;
            name: string;
        };
        history: {
            date: string;
            sets: {
                id: number;
                setNumber: number;
                previousWeight: number | null;
                previousReps: number | null;
                currentWeight: number | null;
                currentReps: number | null;
                repMax: number | null;
                confirmed: boolean;
            }[];
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(req: any, id: string): Promise<import("../entities/exercise.entity").Exercise>;
    update(req: any, id: string, updateExerciseDto: UpdateExerciseDto): Promise<import("../entities/exercise.entity").Exercise>;
    remove(req: any, id: string): Promise<{
        success: boolean;
        message: string;
        id: number;
        name: string;
    }>;
}
