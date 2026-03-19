import { WorkoutsService } from './workouts.service';
import { LogSetDto } from './dto/log-set.dto';
export declare class WorkoutsController {
    private workoutsService;
    constructor(workoutsService: WorkoutsService);
    logSet(req: any, logSetDto: LogSetDto): Promise<any>;
}
