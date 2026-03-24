import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class ChangeWorkoutExerciseDto {
  @ApiProperty({
    example: 24,
    description: 'Nowe ID cwiczenia przypisanego do pozycji w aktywnym treningu',
  })
  @IsInt()
  @Type(() => Number)
  exerciseId: number;
}
