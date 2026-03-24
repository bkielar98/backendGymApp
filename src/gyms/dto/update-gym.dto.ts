import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGymDto {
  @ApiProperty({ example: 'Updated Gym Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({ example: -74.0060, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ example: 150.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  radius?: number;
}
