import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { User } from '../entities/user.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
export declare class ExercisesService {
    private exerciseRepository;
    private workoutExerciseRepository;
    constructor(exerciseRepository: Repository<Exercise>, workoutExerciseRepository: Repository<WorkoutExercise>);
    create(user: User, createExerciseDto: CreateExerciseDto): Promise<Exercise>;
    findAll(user: User): Promise<Exercise[]>;
    findCustom(user: User): Promise<Exercise[]>;
    findOne(user: User, id: number): Promise<Exercise>;
    findHistory(user: User, id: number): Promise<{
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
    }[]>;
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
}
