import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { MAX_BODY_MEASUREMENT_CM } from '../../common/constants/workout.constants';

export class CreateBodyMeasurementEntryDto {
  @ApiProperty({ example: '2026-03-11' })
  @IsDateString()
  recordedOn: string;

  @ApiPropertyOptional({ example: 37, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  neck?: number | null;

  @ApiPropertyOptional({ example: 118, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  shoulders?: number | null;

  @ApiPropertyOptional({ example: 104, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  chest?: number | null;

  @ApiPropertyOptional({ example: 33, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  leftBiceps?: number | null;

  @ApiPropertyOptional({ example: 33.2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  rightBiceps?: number | null;

  @ApiPropertyOptional({ example: 29, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  leftForearm?: number | null;

  @ApiPropertyOptional({ example: 29.1, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  rightForearm?: number | null;

  @ApiPropertyOptional({ example: 90, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  upperAbs?: number | null;

  @ApiPropertyOptional({ example: 82, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  waist?: number | null;

  @ApiPropertyOptional({ example: 86, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  lowerAbs?: number | null;

  @ApiPropertyOptional({ example: 98, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  hips?: number | null;

  @ApiPropertyOptional({ example: 58, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  leftThigh?: number | null;

  @ApiPropertyOptional({ example: 58.4, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  rightThigh?: number | null;

  @ApiPropertyOptional({ example: 37, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  leftCalf?: number | null;

  @ApiPropertyOptional({ example: 37.2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_BODY_MEASUREMENT_CM)
  @Type(() => Number)
  rightCalf?: number | null;
}
