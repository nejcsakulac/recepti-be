import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsDateString } from 'class-validator';

export class UserRegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

}
