import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ChangeWorkoutTemplateExercisePositionDto {
  @ApiProperty({
    example: 2,
    description: 'Nowa pozycja ćwiczenia w planie',
  })
  @IsInt()
  @Min(0)
  order: number;
}
