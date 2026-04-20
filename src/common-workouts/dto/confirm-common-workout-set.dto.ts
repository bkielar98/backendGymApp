import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';
import {
  MAX_REPS_PER_SET,
  MAX_WEIGHT_KG,
} from '../../common/constants/workout.constants';

export class ConfirmCommonWorkoutSetDto {
  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  @Max(MAX_WEIGHT_KG)
  @Type(() => Number)
  currentWeight: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(0)
  @Max(MAX_REPS_PER_SET)
  @Type(() => Number)
  currentReps: number;
}
