import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddWorkoutTemplateExerciseDto {
  @ApiProperty({
    example: 5,
    description: 'ID ćwiczenia do dodania do planu',
  })
  @IsInt()
  exerciseId: number;

  @ApiProperty({
    example: 4,
    description: 'Liczba serii dla nowej pozycji w planie',
  })
  @IsInt()
  @Min(1)
  setsCount: number;

  @ApiProperty({
    example: 2,
    description: 'Pozycja ćwiczenia w planie',
  })
  @IsInt()
  @Min(0)
  order: number;
}
