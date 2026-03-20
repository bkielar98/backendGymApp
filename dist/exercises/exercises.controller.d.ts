import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';
export declare class ExercisesController {
    private exercisesService;
    constructor(exercisesService: ExercisesService);
    create(req: any, createExerciseDto: CreateExerciseDto): Promise<{
        item: import("../entities/exercise.entity").Exercise;
    }>;
    findAll(req: any): Promise<{
        items: import("../entities/exercise.entity").Exercise[];
        total: number;
    }>;
    findCustom(req: any): Promise<{
        items: import("../entities/exercise.entity").Exercise[];
        total: number;
    }>;
    findOne(req: any, id: string): Promise<{
        item: import("../entities/exercise.entity").Exercise;
    }>;
    update(req: any, id: string, updateExerciseDto: UpdateExerciseDto): Promise<{
        item: import("../entities/exercise.entity").Exercise;
    }>;
    remove(req: any, id: string): Promise<{
        success: boolean;
        message: string;
        item: {
            id: number;
            name: string;
        };
    }>;
}
