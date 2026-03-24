import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGymDto {
  @ApiProperty({ example: 'Local Gym' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: -74.0060 })
  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  radius: number;
}
