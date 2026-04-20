import { describe, expect, it } from '@jest/globals';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfirmCommonWorkoutSetDto } from '../common-workouts/dto/confirm-common-workout-set.dto';
import { StartCommonWorkoutDto } from '../common-workouts/dto/start-common-workout.dto';
import { UpdateCommonWorkoutSetDto } from '../common-workouts/dto/update-common-workout-set.dto';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { CreateBodyMeasurementEntryDto } from '../users/dto/create-body-measurement-entry.dto';
import { CreateWeightEntryDto } from '../users/dto/create-weight-entry.dto';

describe('Validation integration', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
  });

  it('rejects absurd body weight values', async () => {
    await expect(
      pipe.transform(
        {
          recordedOn: '2026-04-20',
          weight: 98321741982749878,
        },
        {
          type: 'body',
          metatype: CreateWeightEntryDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects absurd workout set weight values', async () => {
    await expect(
      pipe.transform(
        {
          currentWeight: 98321741982749878,
        },
        {
          type: 'body',
          metatype: UpdateCommonWorkoutSetDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects absurd confirmed workout set values', async () => {
    await expect(
      pipe.transform(
        {
          currentWeight: 98321741982749878,
          currentReps: 8,
        },
        {
          type: 'body',
          metatype: ConfirmCommonWorkoutSetDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts nullable body measurements', async () => {
    await expect(
      pipe.transform(
        {
          recordedOn: '2026-04-20',
          neck: null,
          shoulders: 120,
          chest: null,
          waist: 83,
        },
        {
          type: 'body',
          metatype: CreateBodyMeasurementEntryDto,
        },
      ),
    ).resolves.toEqual({
      recordedOn: '2026-04-20',
      neck: null,
      shoulders: 120,
      chest: null,
      waist: 83,
    });
  });

  it('rejects workout names made only of spaces', async () => {
    await expect(
      pipe.transform(
        {
          name: '     ',
        },
        {
          type: 'body',
          metatype: StartCommonWorkoutDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects exercise names made only of spaces', async () => {
    await expect(
      pipe.transform(
        {
          name: '   ',
          muscleGroups: ['chest'],
        },
        {
          type: 'body',
          metatype: CreateExerciseDto,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
