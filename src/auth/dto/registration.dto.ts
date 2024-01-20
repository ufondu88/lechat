import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  MinLength,
} from 'class-validator';

export class RegistrationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  @Length(8, 20, {
    message:
      'Password must be between 8 and 20 characters long, but actual is $value',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  telephone: string;
}
