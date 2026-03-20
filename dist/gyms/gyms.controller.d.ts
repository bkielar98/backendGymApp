import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
export declare class GymsController {
    private gymsService;
    constructor(gymsService: GymsService);
    create(createGymDto: CreateGymDto): Promise<{
        item: import("../entities/gym.entity").Gym;
    }>;
    findAll(): Promise<{
        items: import("../entities/gym.entity").Gym[];
        total: number;
    }>;
    findOne(id: string): Promise<{
        item: import("../entities/gym.entity").Gym;
    }>;
    update(id: string, updateGymDto: UpdateGymDto): Promise<{
        item: import("../entities/gym.entity").Gym;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        item: {
            id: number;
            name: string;
        };
    }>;
}
