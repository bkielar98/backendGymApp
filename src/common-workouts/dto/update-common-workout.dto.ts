import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCommonWorkoutDto {
  @ApiPropertyOptional({ example: 'Push day duo updated' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
