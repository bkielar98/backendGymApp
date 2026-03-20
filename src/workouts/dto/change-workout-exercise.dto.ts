import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ChangeWorkoutExerciseDto {
  @ApiProperty({
    example: 24,
    description: 'Nowe ID cwiczenia przypisanego do pozycji w aktywnym treningu',
  })
  @IsInt()
  exerciseId: number;
}
