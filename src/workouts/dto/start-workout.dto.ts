import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartWorkoutDto {
  @ApiProperty({
    example: 1,
    description: 'ID planu treningowego użytkownika',
  })
  @IsInt()
  templateId: number;
}