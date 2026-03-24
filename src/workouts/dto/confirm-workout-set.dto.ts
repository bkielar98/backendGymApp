import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmWorkoutSetDto {
  @ApiProperty({
    example: 80,
    description: 'Końcowy ciężar zatwierdzonej serii',
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentWeight: number;

  @ApiProperty({
    example: 8,
    description: 'Końcowa liczba powtórzeń zatwierdzonej serii',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  currentReps: number;
}
