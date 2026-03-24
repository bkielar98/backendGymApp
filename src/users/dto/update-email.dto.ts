import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({ example: 'current-password-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  currentPassword: string;

  @ApiProperty({ example: 'new-email@example.com' })
  @IsEmail()
  newEmail: string;
}
