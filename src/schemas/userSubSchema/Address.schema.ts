import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Address {
  @Prop()
  street: String

  @Prop()
  city: String

  @Prop()  
  state: String

  @Prop()
  postalCode: String

  @Prop()
  country: String
}

export const AddressSchema = SchemaFactory.createForClass(Address);