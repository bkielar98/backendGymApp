import { Repository } from 'typeorm';
import { MuscleStatus } from '../entities/muscle-status.entity';
import { CreateMuscleStatusDto } from './dto/create-muscle-status.dto';
import { UpdateMuscleStatusDto } from './dto/update-muscle-status.dto';
export declare class MuscleStatusService {
    private muscleStatusRepository;
    constructor(muscleStatusRepository: Repository<MuscleStatus>);
    create(userId: number, createDto: CreateMuscleStatusDto): Promise<MuscleStatus>;
    findAll(userId: number): Promise<MuscleStatus[]>;
    findOne(id: number): Promise<MuscleStatus>;
    update(id: number, updateDto: UpdateMuscleStatusDto): Promise<MuscleStatus>;
    remove(id: number): Promise<void>;
    updateLastTrained(userId: number, muscleGroups: string[]): Promise<void>;
}
