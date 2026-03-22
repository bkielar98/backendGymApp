import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({ example: 'current-password-123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'new-email@example.com' })
  @IsEmail()
  newEmail: string;
}
