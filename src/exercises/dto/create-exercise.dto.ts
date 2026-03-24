import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayMinSize, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Bench Press' })
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
  @IsString({ each: true })
  muscleGroups: string[];
}
