import { Repository } from 'typeorm';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
export declare class WorkoutTemplatesService {
    private templateRepository;
    private exerciseRepository;
    constructor(templateRepository: Repository<WorkoutTemplate>, exerciseRepository: Repository<Exercise>);
    create(userId: number, createDto: CreateWorkoutTemplateDto): Promise<WorkoutTemplate>;
    findAll(userId: number): Promise<WorkoutTemplate[]>;
    findOne(id: number): Promise<WorkoutTemplate>;
    update(id: number, updateDto: UpdateWorkoutTemplateDto): Promise<WorkoutTemplate>;
    remove(id: number): Promise<void>;
}
