import { WorkoutTemplatesService } from './workout-templates.service';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
export declare class WorkoutTemplatesController {
    private workoutTemplatesService;
    constructor(workoutTemplatesService: WorkoutTemplatesService);
    create(req: any, createDto: CreateWorkoutTemplateDto): Promise<import("../entities/workout-template.entity").WorkoutTemplate>;
    findAll(req: any): Promise<import("../entities/workout-template.entity").WorkoutTemplate[]>;
    findOne(id: string): Promise<import("../entities/workout-template.entity").WorkoutTemplate>;
    update(id: string, updateDto: UpdateWorkoutTemplateDto): Promise<import("../entities/workout-template.entity").WorkoutTemplate>;
    remove(id: string): Promise<void>;
}
