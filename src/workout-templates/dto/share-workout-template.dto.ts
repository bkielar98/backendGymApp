import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ShareWorkoutTemplateDto {
  @ApiPropertyOptional({
    example: [2, 7],
    description: 'ID znajomych, ktorzy maja otrzymac dostep do planu podczas udostepniania',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  memberUserIds?: number[];
}
