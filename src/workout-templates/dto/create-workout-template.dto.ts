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
import { ApiProperty } from '@nestjs/swagger';
import {
  MAX_EXERCISE_SETS,
  MAX_TEMPLATE_EXERCISES,
  MAX_TEMPLATE_LABELS,
  MAX_TEMPLATE_MEMBERS,
  MAX_TEMPLATE_TASKS,
} from '../../common/constants/workout.constants';

export class CreateWorkoutTemplateExerciseDto {
  @ApiProperty({
    example: 1,
    description: 'ID ćwiczenia',
  })
  @IsInt()
  @Type(() => Number)
  exerciseId: number;

  @ApiProperty({
    example: 4,
    description: 'Startowa liczba serii dla ćwiczenia',
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

export class CreateWorkoutTemplateDto {
  @ApiProperty({
    example: 'Upper A',
    description: 'Nazwa planu treningowego',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Np znajomemu poprzez link lub system znajomych',
    description: 'Opis planu treningowego',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: ['push', 'klatka', '4 dni'],
    description: 'Etykiety planu treningowego',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_LABELS)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  labels?: string[];

  @ApiProperty({
    example: '2026-04-11T10:00:00.000Z',
    description: 'Data rozpoczecia planu',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2026-05-11T10:00:00.000Z',
    description: 'Data zakonczenia planu',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    example: ['Dodaj progresje ciezaru', 'Sprawdz regeneracje barkow'],
    description: 'Lista zadan powiazanych z planem',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_TASKS)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  tasks?: string[];

  @ApiProperty({
    example: [2, 7],
    description: 'ID znajomych, ktorzy od razu maja otrzymac dostep do planu',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_MEMBERS)
  @IsInt({ each: true })
  @Type(() => Number)
  memberUserIds?: number[];

  @ApiProperty({
    type: [CreateWorkoutTemplateExerciseDto],
    example: [
      { exerciseId: 1, setsCount: 4, order: 1 },
      { exerciseId: 2, setsCount: 3, order: 2 },
    ],
    description: 'Lista ćwiczeń w planie',
  })
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_EXERCISES)
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutTemplateExerciseDto)
  exercises: CreateWorkoutTemplateExerciseDto[];
}
