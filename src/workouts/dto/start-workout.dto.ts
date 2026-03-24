import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartWorkoutDto {
  @ApiPropertyOptional({
    example: 1,
    description:
      'ID planu treningowego uzytkownika. Pomijaj, jesli trening ma startowac pusty.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  templateId?: number;

  @ApiPropertyOptional({
    example: 'Push Day',
    description: 'Opcjonalna nazwa treningu.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
