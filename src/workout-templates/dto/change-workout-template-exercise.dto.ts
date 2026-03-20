import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ChangeWorkoutTemplateExerciseDto {
  @ApiProperty({
    example: 7,
    description: 'Nowe ID ćwiczenia przypisanego do pozycji w planie',
  })
  @IsInt()
  exerciseId: number;
}
