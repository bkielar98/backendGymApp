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
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutStatus } from '../entities/workout.entity';
import { PaginatedTextSearchQueryDto } from '../common/dto/paginated-text-search-query.dto';

@Injectable()
export class ExercisesService {
  private readonly defaultPage = 1;
  private readonly defaultLimit = 20;
  private readonly maxLimit = 100;

  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(WorkoutExercise)
    private workoutExerciseRepository: Repository<WorkoutExercise>,
  ) {}

  async create(user: User, createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      isGlobal: user.role === UserRole.ADMIN,
      createdByUserId: user.role === UserRole.ADMIN ? null : user.id,
    });

    return this.exerciseRepository.save(exercise);
  }

  async findAll(user: User, query: PaginatedTextSearchQueryDto = {}) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const search = this.normalizeSearch(query.text_search);
    const builder = this.exerciseRepository.createQueryBuilder('exercise');

    if (user.role !== UserRole.ADMIN) {
      builder.where(
        new Brackets((qb) => {
          qb.where('exercise.isGlobal = :isGlobal', { isGlobal: true }).orWhere(
            'exercise.createdByUserId = :userId',
            { userId: user.id },
          );
        }),
      );
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(exercise.name) LIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('LOWER(COALESCE(exercise.description, \'\')) LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('LOWER(exercise."muscleGroups") LIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const [exercises, total] = await builder
      .orderBy('exercise.name', 'ASC')
      .addOrderBy('exercise.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      exercises,
      total,
      page,
      limit,
    };
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

  async findHistory(
    user: User,
    id: number,
    query: PaginatedTextSearchQueryDto = {},
  ) {
    const exercise = await this.findOne(user, id);
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const [workoutExercises, total] = await this.workoutExerciseRepository.findAndCount({
      where: {
        exerciseId: exercise.id,
        workout: {
          userId: user.id,
          status: WorkoutStatus.COMPLETED,
        },
      },
      relations: {
        workout: true,
        sets: true,
      },
      order: {
        workout: {
          finishedAt: 'DESC',
          startedAt: 'DESC',
        },
        order: 'ASC',
        sets: {
          setNumber: 'ASC',
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const groupedByDate = new Map<
      string,
      {
        date: string;
        sets: Array<{
          id: number;
          setNumber: number;
          previousWeight: number | null;
          previousReps: number | null;
          currentWeight: number | null;
          currentReps: number | null;
          repMax: number | null;
          confirmed: boolean;
        }>;
      }
    >();

    for (const workoutExercise of workoutExercises) {
      const workoutDate =
        workoutExercise.workout.finishedAt || workoutExercise.workout.startedAt;
      const dateKey = this.toDateKey(workoutDate);
      const entry = groupedByDate.get(dateKey) || {
        date: dateKey,
        sets: [],
      };

      entry.sets.push(
        ...(workoutExercise.sets || [])
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((set) => ({
            id: set.id,
            setNumber: set.setNumber,
            previousWeight: set.previousWeight,
            previousReps: set.previousReps,
            currentWeight: set.currentWeight,
            currentReps: set.currentReps,
            repMax: set.repMax,
            confirmed: set.confirmed,
          })),
      );

      groupedByDate.set(dateKey, entry);
    }

    return {
      exercise: {
        id: exercise.id,
        name: exercise.name,
      },
      history: Array.from(groupedByDate.values()).sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
      total,
      page,
      limit,
    };
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
      id: exercise.id,
      name: exercise.name,
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

  private toDateKey(date: Date) {
    return new Date(date).toISOString().slice(0, 10);
  }

  private normalizePage(page?: number): number {
    return typeof page === 'number' && page > 0 ? page : this.defaultPage;
  }

  private normalizeLimit(limit?: number): number {
    if (typeof limit !== 'number' || limit <= 0) {
      return this.defaultLimit;
    }

    return Math.min(limit, this.maxLimit);
  }

  private normalizeSearch(search?: string): string | null {
    const normalized = search?.trim().toLowerCase();
    return normalized ? normalized : null;
  }
}
