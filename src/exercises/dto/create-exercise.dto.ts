import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bench Press' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Chest exercise', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['chest', 'triceps'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  muscleGroups: string[];
}