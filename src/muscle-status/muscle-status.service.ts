import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MuscleStatus } from '../entities/muscle-status.entity';
import { CreateMuscleStatusDto } from './dto/create-muscle-status.dto';
import { UpdateMuscleStatusDto } from './dto/update-muscle-status.dto';

@Injectable()
export class MuscleStatusService {
  constructor(
    @InjectRepository(MuscleStatus)
    private muscleStatusRepository: Repository<MuscleStatus>,
  ) {}

  async create(userId: number, createDto: CreateMuscleStatusDto): Promise<MuscleStatus> {
    const status = this.muscleStatusRepository.create({
      userId,
      ...createDto,
    });
    return this.muscleStatusRepository.save(status);
  }

  async findAll(userId: number): Promise<MuscleStatus[]> {
    return this.muscleStatusRepository.find({ where: { userId } });
  }

  async findOne(id: number): Promise<MuscleStatus> {
    const status = await this.muscleStatusRepository.findOne({ where: { id } });

    if (!status) {
      throw new NotFoundException('Muscle status not found');
    }

    return status;
  }

  async update(id: number, updateDto: UpdateMuscleStatusDto): Promise<MuscleStatus> {
    await this.muscleStatusRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const status = await this.findOne(id);
    await this.muscleStatusRepository.delete(id);

    return {
      success: true,
      message: 'Muscle status removed',
      id: status.id,
      muscleGroup: status.muscleGroup,
    };
  }

  // For recovery logic
  async updateLastTrained(userId: number, muscleGroups: string[]): Promise<void> {
    for (const group of muscleGroups) {
      await this.muscleStatusRepository.upsert({
        userId,
        muscleGroup: group,
        lastTrainedAt: new Date(),
      }, ['userId', 'muscleGroup']);
    }
  }
}
