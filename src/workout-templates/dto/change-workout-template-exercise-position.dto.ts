import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ChangeWorkoutTemplateExercisePositionDto {
  @ApiProperty({
    example: 2,
    description: 'Nowa pozycja ćwiczenia w planie',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order: number;
}
