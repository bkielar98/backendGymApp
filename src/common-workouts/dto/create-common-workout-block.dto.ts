import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_EXERCISE_SETS } from '../../common/constants/workout.constants';

export class CreateCommonWorkoutBlockDto {
  @ApiPropertyOptional({ example: 27 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  defaultExerciseId?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_EXERCISE_SETS)
  @Type(() => Number)
  setsCount?: number;
}
