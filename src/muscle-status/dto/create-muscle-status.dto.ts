import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMuscleStatusDto {
  @ApiProperty({ example: 'chest' })
  @IsNotEmpty()
  @IsString()
  muscleGroup: string;

  @ApiProperty({ example: '2023-10-01T10:00:00Z', required: false })
  @IsOptional()
  lastTrainedAt?: Date;
}