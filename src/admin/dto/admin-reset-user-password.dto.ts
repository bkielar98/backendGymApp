import { IsString, MinLength } from 'class-validator';

export class AdminResetUserPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}
