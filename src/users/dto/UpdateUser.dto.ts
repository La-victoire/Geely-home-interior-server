import { IsOptional, IsString } from "class-validator";
import { Address } from "src/schemas/userSubSchema/Address.schema";

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  addresses?: Address[];

}