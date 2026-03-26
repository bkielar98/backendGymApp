import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class StartCommonWorkoutDto {
  @ApiPropertyOptional({
    example: [15, 19],
    description: 'Lista dodatkowych uczestnikow. Zalogowany user jest dodawany automatycznie.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  participantUserIds?: number[];

  @ApiPropertyOptional({
    example: 3,
    description: 'Opcjonalne ID templateki, z ktorej ma wystartowac wspolny trening.',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  templateId?: number;

  @ApiPropertyOptional({
    example: 'Push day duo',
    description: 'Opcjonalna nazwa wspolnego treningu.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
