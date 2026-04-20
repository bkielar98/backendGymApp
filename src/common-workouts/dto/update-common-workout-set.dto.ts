import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import {
  MAX_REPS_PER_SET,
  MAX_WEIGHT_KG,
} from '../../common/constants/workout.constants';

export class UpdateCommonWorkoutSetDto {
  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_WEIGHT_KG)
  @Type(() => Number)
  currentWeight?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_REPS_PER_SET)
  @Type(() => Number)
  currentReps?: number;
}
