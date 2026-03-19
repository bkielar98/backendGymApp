import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';

@Injectable()
export class WorkoutTemplatesService {
  constructor(
    @InjectRepository(WorkoutTemplate)
    private templateRepository: Repository<WorkoutTemplate>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async create(userId: number, createDto: CreateWorkoutTemplateDto): Promise<WorkoutTemplate> {
    const exercises = await this.exerciseRepository.findByIds(createDto.exerciseIds);
    const template = this.templateRepository.create({
      name: createDto.name,
      userId,
      exercises,
    });
    return this.templateRepository.save(template);
  }

  async findAll(userId: number): Promise<WorkoutTemplate[]> {
    return this.templateRepository.find({
      where: { userId },
      relations: ['exercises'],
    });
  }

  async findOne(id: number): Promise<WorkoutTemplate> {
    return this.templateRepository.findOne({
      where: { id },
      relations: ['exercises'],
    });
  }

  async update(id: number, updateDto: UpdateWorkoutTemplateDto): Promise<WorkoutTemplate> {
    if (updateDto.exerciseIds) {
      const exercises = await this.exerciseRepository.findByIds(updateDto.exerciseIds);
      await this.templateRepository.update(id, { ...updateDto, exercises });
    } else {
      await this.templateRepository.update(id, updateDto);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.templateRepository.delete(id);
  }
}