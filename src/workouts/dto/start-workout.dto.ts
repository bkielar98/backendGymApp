import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartWorkoutDto {
  @ApiPropertyOptional({
    example: 1,
    description:
      'ID planu treningowego uzytkownika. Pomijaj, jesli trening ma startowac pusty.',
  })
  @IsOptional()
  @IsInt()
  templateId?: number;

  @ApiPropertyOptional({
    example: 'Push Day',
    description: 'Opcjonalna nazwa treningu.',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
