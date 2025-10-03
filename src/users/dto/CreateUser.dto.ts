import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;
  
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
  
  @IsOptional()
  @IsIn(['Client', 'Admin'])
  role?: 'Client' | 'Admin'
}