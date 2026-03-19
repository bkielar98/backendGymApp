import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogSetDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  exerciseId: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  reps: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  gymId: number;
}