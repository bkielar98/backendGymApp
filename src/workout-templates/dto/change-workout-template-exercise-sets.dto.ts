import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { MAX_EXERCISE_SETS } from '../../common/constants/workout.constants';

export class ChangeWorkoutTemplateExerciseSetsDto {
  @ApiProperty({
    example: 5,
    description: 'Nowa liczba serii dla pozycji w planie',
  })
  @IsInt()
  @Min(1)
  @Max(MAX_EXERCISE_SETS)
  @Type(() => Number)
  setsCount: number;
}
