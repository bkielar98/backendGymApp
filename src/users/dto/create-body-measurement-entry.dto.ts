import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

export class CreateBodyMeasurementEntryDto {
  @ApiProperty({ example: '2026-03-11' })
  @IsDateString()
  recordedOn: string;

  @ApiProperty({ example: 37 })
  @IsNumber()
  neck: number;

  @ApiProperty({ example: 118 })
  @IsNumber()
  shoulders: number;

  @ApiProperty({ example: 104 })
  @IsNumber()
  chest: number;

  @ApiProperty({ example: 33 })
  @IsNumber()
  leftBiceps: number;

  @ApiProperty({ example: 33.2 })
  @IsNumber()
  rightBiceps: number;

  @ApiProperty({ example: 29 })
  @IsNumber()
  leftForearm: number;

  @ApiProperty({ example: 29.1 })
  @IsNumber()
  rightForearm: number;

  @ApiProperty({ example: 90 })
  @IsNumber()
  upperAbs: number;

  @ApiProperty({ example: 82 })
  @IsNumber()
  waist: number;

  @ApiProperty({ example: 86 })
  @IsNumber()
  lowerAbs: number;

  @ApiProperty({ example: 98 })
  @IsNumber()
  hips: number;

  @ApiProperty({ example: 58 })
  @IsNumber()
  leftThigh: number;

  @ApiProperty({ example: 58.4 })
  @IsNumber()
  rightThigh: number;

  @ApiProperty({ example: 37 })
  @IsNumber()
  leftCalf: number;

  @ApiProperty({ example: 37.2 })
  @IsNumber()
  rightCalf: number;
}
