import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator"

export class OrderItemsDto {
  @IsString()
  productId: String;

  @IsString()
  name: String;

  @IsNumber()
  quantity: Number;

  @IsNumber()
  price: Number;
}

export class InitiateOrderDto {
  @IsString()
  client: string;

  @IsArray()
  @ValidateNested({each: true})
  @Type(() => OrderItemsDto)
  items:OrderItemsDto[]
}