import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_TEMPLATE_MEMBERS } from '../../common/constants/workout.constants';

export class ShareWorkoutTemplateDto {
  @ApiPropertyOptional({
    example: [2, 7],
    description: 'ID znajomych, ktorzy maja otrzymac dostep do planu podczas udostepniania',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_MEMBERS)
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  memberUserIds?: number[];
}
