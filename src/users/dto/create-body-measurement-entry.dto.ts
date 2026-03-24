import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, Min } from 'class-validator';

export class CreateBodyMeasurementEntryDto {
  @ApiProperty({ example: '2026-03-11' })
  @IsDateString()
  recordedOn: string;

  @ApiProperty({ example: 37 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  neck: number;

  @ApiProperty({ example: 118 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shoulders: number;

  @ApiProperty({ example: 104 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  chest: number;

  @ApiProperty({ example: 33 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leftBiceps: number;

  @ApiProperty({ example: 33.2 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rightBiceps: number;

  @ApiProperty({ example: 29 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leftForearm: number;

  @ApiProperty({ example: 29.1 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rightForearm: number;

  @ApiProperty({ example: 90 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  upperAbs: number;

  @ApiProperty({ example: 82 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  waist: number;

  @ApiProperty({ example: 86 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lowerAbs: number;

  @ApiProperty({ example: 98 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hips: number;

  @ApiProperty({ example: 58 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leftThigh: number;

  @ApiProperty({ example: 58.4 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rightThigh: number;

  @ApiProperty({ example: 37 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  leftCalf: number;

  @ApiProperty({ example: 37.2 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  rightCalf: number;
}
