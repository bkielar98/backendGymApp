import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, Max, MaxLength, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  MAX_GYM_RADIUS_METERS,
  MAX_LATITUDE,
  MAX_LONGITUDE,
  MIN_LATITUDE,
  MIN_LONGITUDE,
} from '../../common/constants/workout.constants';

export class UpdateGymDto {
  @ApiProperty({ example: 'Updated Gym Name', required: false })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  @Min(MIN_LATITUDE)
  @Max(MAX_LATITUDE)
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({ example: -74.0060, required: false })
  @IsOptional()
  @IsNumber()
  @Min(MIN_LONGITUDE)
  @Max(MAX_LONGITUDE)
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ example: 150.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_GYM_RADIUS_METERS)
  @Type(() => Number)
  radius?: number;
}
