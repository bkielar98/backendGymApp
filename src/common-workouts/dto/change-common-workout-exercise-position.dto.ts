import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ChangeCommonWorkoutExercisePositionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order: number;
}
