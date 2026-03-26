import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateFriendRequestDto {
  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  targetUserId: number;
}
