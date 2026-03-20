import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWorkoutDto {
  @ApiPropertyOptional({
    example: 'Upper A - live edit',
    description: 'Opcjonalna nowa nazwa treningu',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
