import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
export declare class ExercisesController {
    private exercisesService;
    constructor(exercisesService: ExercisesService);
    create(req: any, createExerciseDto: CreateExerciseDto): Promise<import("../entities/exercise.entity").Exercise>;
    findAll(req: any): Promise<import("../entities/exercise.entity").Exercise[]>;
    findOne(req: any, id: string): Promise<import("../entities/exercise.entity").Exercise>;
    update(req: any, id: string, updateExerciseDto: UpdateExerciseDto): Promise<import("../entities/exercise.entity").Exercise>;
    remove(req: any, id: string): Promise<void>;
}
