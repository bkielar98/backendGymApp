import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MAX_EXERCISE_SETS,
  MAX_TEMPLATE_EXERCISES,
  MAX_TEMPLATE_LABELS,
  MAX_TEMPLATE_MEMBERS,
  MAX_TEMPLATE_TASKS,
} from '../../common/constants/workout.constants';

export class UpdateWorkoutTemplateExerciseDto {
  @ApiPropertyOptional({
    example: 12,
    description:
      'ID wpisu ćwiczenia w planie. Podaj przy edycji istniejącego elementu, pomiń przy dodawaniu nowego.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @ApiProperty({
    example: 5,
    description: 'ID ćwiczenia, które ma być przypisane do planu',
  })
  @IsInt()
  @Type(() => Number)
  exerciseId: number;

  @ApiProperty({
    example: 4,
    description: 'Liczba serii dla ćwiczenia w planie',
  })
  @IsInt()
  @Min(1)
  @Max(MAX_EXERCISE_SETS)
  @Type(() => Number)
  setsCount: number;

  @ApiProperty({
    example: 1,
    description: 'Kolejność ćwiczenia w planie',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order: number;
}

export class UpdateWorkoutTemplateDto {
  @ApiPropertyOptional({
    example: 'Upper B',
    description: 'Nowa nazwa planu treningowego',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'Np znajomemu poprzez link lub system znajomych',
    description: 'Opis planu treningowego',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    example: ['push', 'klatka', '4 dni'],
    description: 'Etykiety planu treningowego',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_LABELS)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  labels?: string[];

  @ApiPropertyOptional({
    example: '2026-04-11T10:00:00.000Z',
    description: 'Data rozpoczecia planu',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({
    example: '2026-05-11T10:00:00.000Z',
    description: 'Data zakonczenia planu',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({
    example: ['Dodaj progresje ciezaru', 'Sprawdz regeneracje barkow'],
    description: 'Lista zadan powiazanych z planem',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_TASKS)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  tasks?: string[];

  @ApiPropertyOptional({
    example: [2, 7],
    description: 'Pelna lista czlonkow, ktorzy maja miec dostep do planu',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_MEMBERS)
  @IsInt({ each: true })
  @Type(() => Number)
  memberUserIds?: number[];

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
  @ArrayMaxSize(MAX_TEMPLATE_EXERCISES)
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkoutTemplateExerciseDto)
  exercises?: UpdateWorkoutTemplateExerciseDto[];
}
