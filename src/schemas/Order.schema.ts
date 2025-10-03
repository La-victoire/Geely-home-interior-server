import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "./User.schema";

@Schema()
export class item {
  @Prop()
  productId: String

  @Prop()
  name: String

  @Prop()
  quantity: Number

  @Prop()
  price: Number
}

export const itemSchema = SchemaFactory.createForClass(item);

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  SHIPPED = 'shipped',
  PAID = 'paid'
}


@Schema({timestamps: true})
export class Order {

  @Prop({
    type: String,
    default: OrderStatus.PENDING,
    enum: Object.values(OrderStatus),
  })
  status: OrderStatus;

  @Prop({default: Date.now })
  date: Date;

  @Prop()
  client: String

  @Prop({
    type: [itemSchema]
  })
  items: item[];

  @Prop({
     type: mongoose.Schema.Types.ObjectId, ref: 'User',
     required: true
    })
  user: User;

  @Prop({
    type: Object
  })
  payment: Record<string,any>;
}

export const orderSchema = SchemaFactory.createForClass(Order)