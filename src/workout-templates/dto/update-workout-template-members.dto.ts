import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkoutTemplateMembersDto {
  @ApiProperty({
    example: [2, 7],
    description: 'Pelna lista ID uzytkownikow, ktorzy maja miec dostep do planu',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  memberUserIds: number[];
}
