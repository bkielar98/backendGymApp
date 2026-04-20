import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
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
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;
}
