import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkoutTemplateDto {
  @ApiProperty({ example: 'Upper Body Workout' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: [1, 2, 3], type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  exerciseIds: number[];
}