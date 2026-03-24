import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'current-password-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  currentPassword: string;

  @ApiProperty({ example: 'new-password-123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  newPassword: string;
}
