import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkoutTemplateDto {
  @ApiProperty({ example: 'Updated Workout', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: [1, 2, 4], type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  exerciseIds?: number[];
}