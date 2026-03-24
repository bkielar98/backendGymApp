import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, Min } from 'class-validator';

export class CreateWeightEntryDto {
  @ApiProperty({ example: '2026-03-11' })
  @IsDateString()
  recordedOn: string;

  @ApiProperty({ example: 80.2 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight: number;
}
