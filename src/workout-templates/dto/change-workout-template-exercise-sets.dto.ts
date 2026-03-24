import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ChangeWorkoutTemplateExerciseSetsDto {
  @ApiProperty({
    example: 5,
    description: 'Nowa liczba serii dla pozycji w planie',
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  setsCount: number;
}
