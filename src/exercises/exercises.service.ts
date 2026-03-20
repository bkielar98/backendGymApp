import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
  ) {}

  async create(user: User, createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      isGlobal: user.role === UserRole.ADMIN,
      createdByUserId: user.role === UserRole.ADMIN ? null : user.id,
    });

    return this.exerciseRepository.save(exercise);
  }

  async findAll(user: User): Promise<Exercise[]> {
    if (user.role === UserRole.ADMIN) {
      return this.exerciseRepository.find({
        order: {
          name: 'ASC',
        },
      });
    }

    return this.exerciseRepository
      .createQueryBuilder('exercise')
      .where('exercise.isGlobal = :isGlobal', { isGlobal: true })
      .orWhere(
        new Brackets((qb) => {
          qb.where('exercise.createdByUserId = :userId', { userId: user.id });
        }),
      )
      .orderBy('exercise.name', 'ASC')
      .getMany();
  }

  async findCustom(user: User): Promise<Exercise[]> {
    if (user.role === UserRole.ADMIN) {
      return this.exerciseRepository.find({
        where: {
          isGlobal: false,
        },
        order: {
          name: 'ASC',
        },
      });
    }

    return this.exerciseRepository.find({
      where: {
        isGlobal: false,
        createdByUserId: user.id,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(user: User, id: number): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({ where: { id } });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    this.ensureUserCanAccessExercise(user, exercise);

    return exercise;
  }

  async update(
    user: User,
    id: number,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    const exercise = await this.findOne(user, id);
    this.ensureUserCanManageExercise(user, exercise);

    await this.exerciseRepository.update(id, updateExerciseDto);
    return this.findOne(user, id);
  }

  async remove(user: User, id: number) {
    const exercise = await this.findOne(user, id);
    this.ensureUserCanManageExercise(user, exercise);
    await this.exerciseRepository.delete(id);

    return {
      success: true,
      message: 'Exercise removed',
      item: {
        id: exercise.id,
        name: exercise.name,
      },
    };
  }

  private ensureUserCanAccessExercise(user: User, exercise: Exercise) {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (exercise.isGlobal) {
      return;
    }

    if (exercise.createdByUserId === user.id) {
      return;
    }

    throw new NotFoundException('Exercise not found');
  }

  private ensureUserCanManageExercise(user: User, exercise: Exercise) {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (!exercise.isGlobal && exercise.createdByUserId === user.id) {
      return;
    }

    throw new ForbiddenException('You cannot modify this exercise');
  }
}
