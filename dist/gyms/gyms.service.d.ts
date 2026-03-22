import { Repository } from 'typeorm';
import { Gym } from '../entities/gym.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
export declare class GymsService {
    private gymRepository;
    constructor(gymRepository: Repository<Gym>);
    create(createGymDto: CreateGymDto): Promise<Gym>;
    findAll(): Promise<Gym[]>;
    findOne(id: number): Promise<Gym>;
    update(id: number, updateGymDto: UpdateGymDto): Promise<Gym>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
        id: number;
        name: string;
    }>;
}
