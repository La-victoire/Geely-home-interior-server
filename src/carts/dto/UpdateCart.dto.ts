import { IsMongoId, IsNumber, Min } from "class-validator";

export class UpdateCartDto {
  @IsNumber()
  @Min(1)
  quantity: number;

}