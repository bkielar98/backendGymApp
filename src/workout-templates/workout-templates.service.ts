import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WorkoutTemplate } from '../entities/workout-template.entity';
import { Exercise } from '../entities/exercise.entity';
import { WorkoutTemplateExercise } from '../entities/workout-template-exercise.entity';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { AddWorkoutTemplateExerciseDto } from './dto/add-workout-template-exercise.dto';

@Injectable()
export class WorkoutTemplatesService {
  constructor(
    @InjectRepository(WorkoutTemplate)
    private readonly templateRepository: Repository<WorkoutTemplate>,
    @InjectRepository(WorkoutTemplateExercise)
    private readonly templateExerciseRepository: Repository<WorkoutTemplateExercise>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  async create(userId: number, createDto: CreateWorkoutTemplateDto) {
    this.validateTemplateExercises(createDto.exercises);

    const exerciseIds = createDto.exercises.map((item) => item.exerciseId);
    const exercises = await this.exerciseRepository.find({
      where: { id: In(exerciseIds) },
    });

    const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));

    const template = this.templateRepository.create({
      name: createDto.name,
      userId,
      exercises: createDto.exercises.map((item) => {
        const exercise = exerciseMap.get(item.exerciseId);
        if (!exercise) {
          throw new NotFoundException(`Exercise ${item.exerciseId} not found`);
        }

        return this.templateExerciseRepository.create({
          exerciseId: item.exerciseId,
          exercise,
          setsCount: item.setsCount,
          order: item.order,
        });
      }),
    });

    const saved = await this.templateRepository.save(template);
    return this.findOne(userId, saved.id);
  }

  async findAll(userId: number) {
    const templates = await this.templateRepository.find({
      where: { userId },
      order: { id: 'DESC' },
    });

    return templates.map((template) => this.mapTemplate(template));
  }

  async findOne(userId: number, id: number) {
    const template = await this.templateRepository.findOne({
      where: { id, userId },
    });

    if (!template) {
      throw new NotFoundException('Workout template not found');
    }

    return this.mapTemplate(template);
  }

  async update(userId: number, id: number, updateDto: UpdateWorkoutTemplateDto) {
    const template = await this.getTemplateEntityForUser(userId, id);

    if (typeof updateDto.name === 'string') {
      template.name = updateDto.name;
    }

    if (updateDto.exercises) {
      this.validateTemplateExercises(updateDto.exercises);

      const existingItems = template.exercises || [];
      const existingItemsById = new Map(existingItems.map((item) => [item.id, item]));
      const exerciseIds = updateDto.exercises.map((item) => item.exerciseId);
      const exercises = await this.exerciseRepository.find({
        where: { id: In(exerciseIds) },
      });

      const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
      const nextItems: WorkoutTemplateExercise[] = [];
      const keptIds = new Set<number>();

      for (const item of updateDto.exercises) {
        const exercise = exerciseMap.get(item.exerciseId);

        if (!exercise) {
          throw new NotFoundException(`Exercise ${item.exerciseId} not found`);
        }

        if (typeof item.id === 'number') {
          const existingItem = existingItemsById.get(item.id);

          if (!existingItem) {
            throw new NotFoundException(
              `Workout template exercise ${item.id} not found`,
            );
          }

          existingItem.exerciseId = item.exerciseId;
          existingItem.exercise = exercise;
          existingItem.setsCount = item.setsCount;
          existingItem.order = item.order;
          keptIds.add(existingItem.id);
          nextItems.push(existingItem);
          continue;
        }

        nextItems.push(
          this.templateExerciseRepository.create({
            templateId: template.id,
            exerciseId: item.exerciseId,
            exercise,
            setsCount: item.setsCount,
            order: item.order,
          }),
        );
      }

      const idsToDelete = existingItems
        .filter((item) => !keptIds.has(item.id))
        .map((item) => item.id);

      if (idsToDelete.length > 0) {
        await this.templateExerciseRepository.delete(idsToDelete);
      }

      template.exercises = nextItems;
    }

    await this.templateRepository.save(template);
    return this.findOne(userId, template.id);
  }

  async addExercise(
    userId: number,
    templateId: number,
    dto: AddWorkoutTemplateExerciseDto,
  ) {
    const template = await this.getTemplateEntityForUser(userId, templateId);
    const templateExercises = [...(template.exercises || [])];
    const exercise = await this.exerciseRepository.findOne({
      where: { id: dto.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise ${dto.exerciseId} not found`);
    }

    const insertOrder = Math.min(dto.order, templateExercises.length);

    for (const item of templateExercises) {
      if (item.order >= insertOrder) {
        item.order += 1;
      }
    }

    await this.templateExerciseRepository.save(templateExercises);

    const templateExercise = this.templateExerciseRepository.create({
      templateId: template.id,
      template,
      exerciseId: dto.exerciseId,
      exercise,
      setsCount: dto.setsCount,
      order: insertOrder,
    });

    await this.templateExerciseRepository.save(templateExercise);

    return this.findOne(userId, template.id);
  }

  async changeExercisePosition(
    userId: number,
    templateId: number,
    templateExerciseId: number,
    order: number,
  ) {
    const template = await this.getTemplateEntityForUser(userId, templateId);
    const templateExercises = [...(template.exercises || [])];
    const templateExercise = this.getTemplateExerciseForTemplate(
      template,
      templateExerciseId,
    );
    const maxOrder = Math.max(0, templateExercises.length - 1);
    const targetOrder = Math.max(0, Math.min(order, maxOrder));
    const currentOrder = templateExercise.order;

    if (currentOrder === targetOrder) {
      return this.findOne(userId, template.id);
    }

    for (const item of templateExercises) {
      if (item.id === templateExercise.id) {
        continue;
      }

      if (targetOrder < currentOrder) {
        if (item.order >= targetOrder && item.order < currentOrder) {
          item.order += 1;
        }
      } else if (item.order <= targetOrder && item.order > currentOrder) {
        item.order -= 1;
      }
    }

    templateExercise.order = targetOrder;
    await this.templateExerciseRepository.save(templateExercises);

    return this.findOne(userId, template.id);
  }

  async changeExercise(
    userId: number,
    templateId: number,
    templateExerciseId: number,
    exerciseId: number,
  ) {
    const template = await this.getTemplateEntityForUser(userId, templateId);
    const templateExercise = this.getTemplateExerciseForTemplate(
      template,
      templateExerciseId,
    );
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`);
    }

    templateExercise.exerciseId = exerciseId;
    templateExercise.exercise = exercise;
    await this.templateExerciseRepository.save(templateExercise);

    return this.findOne(userId, template.id);
  }

  async changeExerciseSetsCount(
    userId: number,
    templateId: number,
    templateExerciseId: number,
    setsCount: number,
  ) {
    const template = await this.getTemplateEntityForUser(userId, templateId);
    const templateExercise = this.getTemplateExerciseForTemplate(
      template,
      templateExerciseId,
    );

    templateExercise.setsCount = setsCount;
    await this.templateExerciseRepository.save(templateExercise);

    return this.findOne(userId, template.id);
  }

  async removeExercise(userId: number, templateId: number, templateExerciseId: number) {
    const template = await this.getTemplateEntityForUser(userId, templateId);
    const templateExercise = this.getTemplateExerciseForTemplate(
      template,
      templateExerciseId,
    );

    await this.templateExerciseRepository.delete({
      id: templateExerciseId,
      templateId: template.id,
    });

    const remainingExercises = (template.exercises || []).filter(
      (item) => item.id !== templateExerciseId,
    );

    for (const item of remainingExercises) {
      if (item.order > templateExercise.order) {
        item.order -= 1;
      }
    }

    await this.templateExerciseRepository.save(remainingExercises);

    return this.findOne(userId, template.id);
  }

  async remove(userId: number, id: number) {
    const template = await this.getTemplateEntityForUser(userId, id);

    await this.templateRepository.delete(id);
    return { message: 'Workout template removed' };
  }

  private async getTemplateEntityForUser(userId: number, id: number) {
    const template = await this.templateRepository.findOne({
      where: { id, userId },
    });

    if (!template) {
      throw new NotFoundException('Workout template not found');
    }

    return template;
  }

  private getTemplateExerciseForTemplate(
    template: WorkoutTemplate,
    templateExerciseId: number,
  ) {
    const templateExercise = (template.exercises || []).find(
      (item) => item.id === templateExerciseId,
    );

    if (!templateExercise) {
      throw new NotFoundException('Workout template exercise not found');
    }

    return templateExercise;
  }

  private mapTemplate(template: WorkoutTemplate) {
    return {
      id: template.id,
      name: template.name,
      exercises: [...(template.exercises || [])]
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          id: item.id,
          exerciseId: item.exerciseId,
          order: item.order,
          setsCount: item.setsCount,
          exercise: item.exercise
            ? {
                id: item.exercise.id,
                name: item.exercise.name,
                description: item.exercise.description,
                muscleGroups: item.exercise.muscleGroups,
              }
            : null,
        })),
    };
  }

  private validateTemplateExercises(
    exercises: Array<{ id?: number; exerciseId: number; setsCount: number; order: number }>,
  ) {
    const orders = new Set<number>();
    const ids = new Set<number>();

    for (const item of exercises) {
      if (orders.has(item.order)) {
        throw new BadRequestException(
          `Order ${item.order} is duplicated in workout template exercises`,
        );
      }

      orders.add(item.order);

      if (typeof item.id === 'number') {
        if (ids.has(item.id)) {
          throw new BadRequestException(
            `Workout template exercise ${item.id} is duplicated in request`,
          );
        }

        ids.add(item.id);
      }
    }
  }
}
