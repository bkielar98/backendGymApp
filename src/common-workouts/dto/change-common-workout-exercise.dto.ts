import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ChangeCommonWorkoutExerciseDto {
  @ApiProperty({ example: 24 })
  @IsInt()
  @Type(() => Number)
  exerciseId: number;
}
