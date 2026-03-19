import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGymDto {
  @ApiProperty({ example: 'Local Gym' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.0060 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  radius: number;
}