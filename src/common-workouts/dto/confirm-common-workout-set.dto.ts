import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class ConfirmCommonWorkoutSetDto {
  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentWeight: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  currentReps: number;
}
