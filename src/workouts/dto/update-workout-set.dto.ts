import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  MAX_REPS_PER_SET,
  MAX_WEIGHT_KG,
} from '../../common/constants/workout.constants';

export class UpdateWorkoutSetDto {
  @ApiPropertyOptional({
    example: 80,
    description: 'Aktualny ciężar wpisany przez użytkownika',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_WEIGHT_KG)
  @Type(() => Number)
  currentWeight?: number;

  @ApiPropertyOptional({
    example: 8,
    description: 'Aktualna liczba powtórzeń wpisana przez użytkownika',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_REPS_PER_SET)
  @Type(() => Number)
  currentReps?: number;
}
