import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsStrongPassword } from "class-validator";

export class AuthUserDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
  
  @IsOptional()
  @IsIn(['Client', 'Admin'])
  role?: 'Client' | 'Admin'
}