import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { GymGateway } from '../gym/gym.gateway';
import { MuscleStatusService } from '../muscle-status/muscle-status.service';
import { LogSetDto } from './dto/log-set.dto';
export declare class WorkoutsService {
    private exerciseRepository;
    private gymGateway;
    private muscleStatusService;
    constructor(exerciseRepository: Repository<Exercise>, gymGateway: GymGateway, muscleStatusService: MuscleStatusService);
    logSet(userId: number, logSetDto: LogSetDto): Promise<any>;
}
