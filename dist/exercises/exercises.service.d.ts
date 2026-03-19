import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
export declare class ExercisesService {
    private exerciseRepository;
    constructor(exerciseRepository: Repository<Exercise>);
    create(createExerciseDto: CreateExerciseDto): Promise<Exercise>;
    findAll(): Promise<Exercise[]>;
    findOne(id: number): Promise<Exercise>;
    update(id: number, updateExerciseDto: UpdateExerciseDto): Promise<Exercise>;
    remove(id: number): Promise<void>;
}
