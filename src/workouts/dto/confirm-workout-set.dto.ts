import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MAX_REPS_PER_SET,
  MAX_WEIGHT_KG,
} from '../../common/constants/workout.constants';

export class ConfirmWorkoutSetDto {
  @ApiProperty({
    example: 80,
    description: 'Końcowy ciężar zatwierdzonej serii',
  })
  @IsNumber()
  @Min(0)
  @Max(MAX_WEIGHT_KG)
  @Type(() => Number)
  currentWeight: number;

  @ApiProperty({
    example: 8,
    description: 'Końcowa liczba powtórzeń zatwierdzonej serii',
  })
  @IsInt()
  @Min(0)
  @Max(MAX_REPS_PER_SET)
  @Type(() => Number)
  currentReps: number;
}
