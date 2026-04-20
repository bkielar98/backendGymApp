import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MAX_COMMON_WORKOUT_PARTICIPANTS } from '../../common/constants/workout.constants';

export class StartCommonWorkoutDto {
  @ApiPropertyOptional({
    example: [15, 19],
    description:
      'Lista dodatkowych uczestnikow. Zalogowany user jest dodawany automatycznie, wiec pusta lista oznacza trening solo.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_COMMON_WORKOUT_PARTICIPANTS - 1)
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
    description: 'Opcjonalna nazwa treningu solo lub grupowego.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;
}
