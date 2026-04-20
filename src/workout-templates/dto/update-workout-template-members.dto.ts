import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_TEMPLATE_MEMBERS } from '../../common/constants/workout.constants';

export class UpdateWorkoutTemplateMembersDto {
  @ApiProperty({
    example: [2, 7],
    description: 'Pelna lista ID uzytkownikow, ktorzy maja miec dostep do planu',
    type: [Number],
  })
  @IsArray()
  @ArrayMaxSize(MAX_TEMPLATE_MEMBERS)
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  memberUserIds: number[];
}
