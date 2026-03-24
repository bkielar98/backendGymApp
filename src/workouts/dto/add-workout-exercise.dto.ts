import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

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
  @Type(() => Number)
  setsCount?: number;
}
