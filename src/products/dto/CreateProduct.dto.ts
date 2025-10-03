import { Type } from "class-transformer";
import { IsArray, IsIn, IsObject, IsOptional, IsString } from "class-validator";

export class dimensionDto {
  @IsString()
  @IsOptional()
  width: string;

  @IsString()
  @IsOptional()
  height: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsIn(['NGN', 'USD'])
  currency?: 'NGN' | 'USD';

  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  images?: [];

  @IsString()
  stock: string;

  @IsString()
  status:string;

  @IsObject()
  @IsOptional()
  @Type(() => dimensionDto)
  dimensions?: dimensionDto;

  @IsOptional()
  features: string[];

  @IsOptional()
  colors?: string[];
}