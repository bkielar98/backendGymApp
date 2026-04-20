import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetWorkoutDashboardStatsDto {
  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  dateFrom: string;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  dateTo: string;
}
