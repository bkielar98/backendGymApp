import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { User } from '../entities/user.entity';
export declare class ExercisesService {
    private exerciseRepository;
    constructor(exerciseRepository: Repository<Exercise>);
    create(user: User, createExerciseDto: CreateExerciseDto): Promise<Exercise>;
    findAll(user: User): Promise<Exercise[]>;
    findOne(user: User, id: number): Promise<Exercise>;
    update(user: User, id: number, updateExerciseDto: UpdateExerciseDto): Promise<Exercise>;
    remove(user: User, id: number): Promise<void>;
    private ensureUserCanAccessExercise;
    private ensureUserCanManageExercise;
}
