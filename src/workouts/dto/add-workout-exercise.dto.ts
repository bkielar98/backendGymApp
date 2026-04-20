import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { MAX_EXERCISE_SETS } from '../../common/constants/workout.constants';

export class AddWorkoutExerciseDto {
  @ApiProperty({
    example: 27,
    description: 'ID cwiczenia, ktore ma zostac dodane do aktywnego treningu',
  })
  @IsInt()
  @Type(() => Number)
  exerciseId: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Pozycja cwiczenia w aktywnym treningu. Domyslnie na koncu listy.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Opcjonalna liczba pustych serii do utworzenia od razu',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_EXERCISE_SETS)
  @Type(() => Number)
  setsCount?: number;
}
