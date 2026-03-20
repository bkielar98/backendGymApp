import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkoutTemplateExerciseDto {
  @ApiPropertyOptional({
    example: 12,
    description:
      'ID wpisu ćwiczenia w planie. Podaj przy edycji istniejącego elementu, pomiń przy dodawaniu nowego.',
  })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({
    example: 5,
    description: 'ID ćwiczenia, które ma być przypisane do planu',
  })
  @IsInt()
  exerciseId: number;

  @ApiProperty({
    example: 4,
    description: 'Liczba serii dla ćwiczenia w planie',
  })
  @IsInt()
  @Min(1)
  setsCount: number;

  @ApiProperty({
    example: 1,
    description: 'Kolejność ćwiczenia w planie',
  })
  @IsInt()
  @Min(0)
  order: number;
}

export class UpdateWorkoutTemplateDto {
  @ApiPropertyOptional({
    example: 'Upper B',
    description: 'Nowa nazwa planu treningowego',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: [UpdateWorkoutTemplateExerciseDto],
    example: [
      { id: 11, exerciseId: 5, setsCount: 5, order: 0 },
      { exerciseId: 7, setsCount: 3, order: 1 },
    ],
    description:
      'Pełna lista ćwiczeń po edycji. Możesz zmienić kolejność, liczbę serii, podmienić ćwiczenie, dodać nowe albo usunąć brakujące.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkoutTemplateExerciseDto)
  exercises?: UpdateWorkoutTemplateExerciseDto[];
}
