import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { MAX_EXERCISE_SETS } from '../../common/constants/workout.constants';

export class AddWorkoutTemplateExerciseDto {
  @ApiProperty({
    example: 5,
    description: 'ID ćwiczenia do dodania do planu',
  })
  @IsInt()
  @Type(() => Number)
  exerciseId: number;

  @ApiProperty({
    example: 4,
    description: 'Liczba serii dla nowej pozycji w planie',
  })
  @IsInt()
  @Min(1)
  @Max(MAX_EXERCISE_SETS)
  @Type(() => Number)
  setsCount: number;

  @ApiProperty({
    example: 2,
    description: 'Pozycja ćwiczenia w planie',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order: number;
}
