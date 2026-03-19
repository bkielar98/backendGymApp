import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGymDto {
  @ApiProperty({ example: 'Updated Gym Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -74.0060, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 150.0, required: false })
  @IsOptional()
  @IsNumber()
  radius?: number;
}