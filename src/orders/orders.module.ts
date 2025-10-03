import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, orderSchema } from 'src/schemas/Order.schema';
import { OrdersController } from './orders.controller';

@Module({
  imports:[ 
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: orderSchema,
      }
    ])
    ],
  controllers:[OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
