import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({ example: 'Updated Name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'male', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'])
  gender?: string;
}
