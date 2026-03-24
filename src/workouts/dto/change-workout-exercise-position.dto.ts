import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ChangeWorkoutExercisePositionDto {
  @ApiProperty({
    example: 1,
    description: 'Nowa pozycja cwiczenia w aktywnym treningu',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order: number;
}
