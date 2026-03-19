import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.exerciseRepository.create(createExerciseDto);
    return this.exerciseRepository.save(exercise);
  }

  async findAll(): Promise<Exercise[]> {
    return this.exerciseRepository.find();
  }

  async findOne(id: number): Promise<Exercise> {
    return this.exerciseRepository.findOne({ where: { id } });
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
    await this.exerciseRepository.update(id, updateExerciseDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.exerciseRepository.delete(id);
  }
}