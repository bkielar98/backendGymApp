import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExerciseDto {
  @ApiProperty({ example: 'Updated Bench Press', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['chest', 'triceps', 'shoulders'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  muscleGroups?: string[];
}