import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./User.schema";
import mongoose from "mongoose";

@Schema()
export class review {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  user: User;

  @Prop()
  comment: string
}

export const reviewSchema = SchemaFactory.createForClass(review);

@Schema()
export class dimension {
  @Prop()
  width: string;

  @Prop()
  height: string;
}

export const dimensionSchema = SchemaFactory.createForClass(dimension)

@Schema()
export class Product {
  @Prop({ required: true})
  name: string;

  @Prop({ required: true})
  description: string;

  @Prop({ required: true})
  price: string;

  @Prop({ default:"NGN", enum:["NGN","USD"], required: false})
  currency?: string;

  @Prop({ required: true})
  category: string;

  @Prop({ required: true})
  images: [{
    url: string,
    public_id: string
  }];

  @Prop({ required: true})
  stock: string;

  @Prop({ required: true})
  status:string;

  @Prop({ type: [reviewSchema], required: false})
  reviews?: review[];

  @Prop({ type: dimensionSchema, required: false})
  dimensions?: dimension;

  @Prop({ required: false})
  features?: string[];

  @Prop({ required: false})
  colors?: string[];
}

export const productSchema = SchemaFactory.createForClass(Product)