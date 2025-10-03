import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { Address, AddressSchema } from "./userSubSchema/Address.schema";
import { Order, orderSchema } from "./Order.schema";
import { UserSettings } from "./UserSettings.schema";

@Schema() 
export class User extends Document {
  @Prop({ required: true})
  firstname: string;

  @Prop({ required: true})
  lastname: string;

  @Prop({required: true})
  password: string;

  @Prop({ required: false})
  phone: string;

  @Prop({ default: "Client", enum: ["Client", "Admin"]})
  role: string;

  @Prop({ required: true, unique: true})
  email: string;

  @Prop({ type: [{ provider: String, providerId: String, email: String }], default: [] })
  providers?: {
    provider: string;
    email?: string
  } [];

  @Prop({
    type: [AddressSchema],
    required: false
  })
  addresses?: Address[];

  @Prop({
   type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}],
   required: false
  })
  orders: Order[];

  @Prop({
   type: [{
    productId:String,
    product: { type: Types.ObjectId, ref: 'Product'},
    quantity: {type:Number, default: 1 },
    price: { type: Number, required: true},
   }],
   default:[],
   required: false
  })  
  cart: Array<{
    productId: string;
    product: Types.ObjectId;
    price: number;
    quantity: number;
  }>

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserSettings'})
  settings?: UserSettings
}

export const userSchema = SchemaFactory.createForClass(User);