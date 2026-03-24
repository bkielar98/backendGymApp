import { IsOptional, IsString, IsArray, ArrayMinSize, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExerciseDto {
  @ApiProperty({ example: 'Updated Bench Press', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: ['chest', 'triceps', 'shoulders'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  muscleGroups?: string[];
}
