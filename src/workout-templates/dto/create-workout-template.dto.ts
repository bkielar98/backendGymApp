import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    type: [CreateWorkoutTemplateExerciseDto],
    example: [
      { exerciseId: 1, setsCount: 4, order: 1 },
      { exerciseId: 2, setsCount: 3, order: 2 },
    ],
    description: 'Lista ćwiczeń w planie',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutTemplateExerciseDto)
  exercises: CreateWorkoutTemplateExerciseDto[];
}
