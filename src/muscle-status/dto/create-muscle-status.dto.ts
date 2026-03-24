import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMuscleStatusDto {
  @ApiProperty({ example: 'chest' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  muscleGroup: string;

  @ApiProperty({ example: '2023-10-01T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => String)
  lastTrainedAt?: string;
}
