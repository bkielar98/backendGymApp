import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkoutSetDto {
  @ApiPropertyOptional({
    example: 80,
    description: 'Aktualny ciężar wpisany przez użytkownika',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentWeight?: number;

  @ApiPropertyOptional({
    example: 8,
    description: 'Aktualna liczba powtórzeń wpisana przez użytkownika',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  currentReps?: number;
}
