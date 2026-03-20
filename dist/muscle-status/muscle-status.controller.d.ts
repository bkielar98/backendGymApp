import { MuscleStatusService } from './muscle-status.service';
import { CreateMuscleStatusDto } from './dto/create-muscle-status.dto';
import { UpdateMuscleStatusDto } from './dto/update-muscle-status.dto';
export declare class MuscleStatusController {
    private muscleStatusService;
    constructor(muscleStatusService: MuscleStatusService);
    create(req: any, createDto: CreateMuscleStatusDto): Promise<{
        item: import("../entities/muscle-status.entity").MuscleStatus;
    }>;
    findAll(req: any): Promise<{
        items: import("../entities/muscle-status.entity").MuscleStatus[];
        total: number;
    }>;
    findOne(id: string): Promise<{
        item: import("../entities/muscle-status.entity").MuscleStatus;
    }>;
    update(id: string, updateDto: UpdateMuscleStatusDto): Promise<{
        item: import("../entities/muscle-status.entity").MuscleStatus;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        item: {
            id: number;
            muscleGroup: string;
        };
    }>;
}
