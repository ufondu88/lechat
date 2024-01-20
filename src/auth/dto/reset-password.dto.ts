import { IsString, IsStrongPassword, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  email: string;

  @IsString()
  currentPassword: string;

  @IsStrongPassword()
  @Length(8, 20, {
    message:
      'Password must be between 8 and 20 characters long, but actual is $value',
  })
  @IsString()
  password: string;

  passwordConfirm: string;
}
