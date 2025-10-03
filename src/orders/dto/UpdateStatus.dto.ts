import { IsEnum } from "class-validator";
import { OrderStatus } from "src/schemas/Order.schema";

export class UpdateStatusDto {
    @IsEnum(OrderStatus, {message: 'Invalid Status value'})
    status: OrderStatus;
}