import { IsOptional, IsString, IsArray, ArrayMinSize, ArrayMaxSize, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_EXERCISE_MUSCLE_GROUPS } from '../../common/constants/workout.constants';

export class UpdateExerciseDto {
  @ApiProperty({ example: 'Updated Bench Press', required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
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
  @ArrayMaxSize(MAX_EXERCISE_MUSCLE_GROUPS)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  muscleGroups?: string[];
}
