import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { GymGateway } from '../gym/gym.gateway';
import { MuscleStatusService } from '../muscle-status/muscle-status.service';
import { LogSetDto } from './dto/log-set.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private gymGateway: GymGateway,
    private muscleStatusService: MuscleStatusService,
  ) {}

  async logSet(userId: number, logSetDto: LogSetDto): Promise<any> {
    const exercise = await this.exerciseRepository.findOne({ where: { id: logSetDto.exerciseId } });
    if (!exercise) {
      throw new Error('Exercise not found');
    }

    const oneRM = logSetDto.weight * (1 + 0.0333 * logSetDto.reps);

    // broadcast
    this.gymGateway.server.to(`gym-${logSetDto.gymId}`).emit('leaderboardUpdate', { userId, oneRM, exerciseId: logSetDto.exerciseId });

    // update muscle
    await this.muscleStatusService.updateLastTrained(userId, exercise.muscleGroups);

    return { oneRM };
  }
}