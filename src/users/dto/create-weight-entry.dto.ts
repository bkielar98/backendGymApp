import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, Max, Min } from 'class-validator';
import { MAX_BODY_WEIGHT_KG } from '../../common/constants/workout.constants';

export class CreateWeightEntryDto {
  @ApiProperty({ example: '2026-03-11' })
  @IsDateString()
  recordedOn: string;

  @ApiProperty({ example: 80.2 })
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_WEIGHT_KG)
  @Type(() => Number)
  weight: number;
}
