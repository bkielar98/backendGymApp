import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ChangeWorkoutTemplateExerciseDto {
  @ApiProperty({
    example: 7,
    description: 'Nowe ID ćwiczenia przypisanego do pozycji w planie',
  })
  @IsInt()
  @Type(() => Number)
  exerciseId: number;
}
