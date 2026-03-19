import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMuscleStatusDto {
  @ApiProperty({ example: '2023-10-02T10:00:00Z', required: false })
  @IsOptional()
  lastTrainedAt?: Date;
}