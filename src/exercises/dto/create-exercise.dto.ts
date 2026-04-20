import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayMinSize, ArrayMaxSize, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MAX_EXERCISE_MUSCLE_GROUPS } from '../../common/constants/workout.constants';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bench Press' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Chest exercise', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: ['chest', 'triceps'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_EXERCISE_MUSCLE_GROUPS)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  muscleGroups: string[];
}
