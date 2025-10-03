import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Order } from 'src/schemas/Order.schema';
import { InitiateOrderDto } from './dto/InitiateOrder.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateStatusDto } from './dto/UpdateStatus.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}
  async initiateOrder(initiateOrderDto: InitiateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel({
      ...initiateOrderDto,
    status: 'pending',
    date: new Date(),
    });
    return await newOrder.save();
  }

  async updatePayment(orderId: string, paymentData: any) {
    const payment = this.orderModel.findByIdAndUpdate(
      orderId, 
      {
        status: paymentData.status,
        payment: paymentData,
      },
      { new: true}
    );

    return await payment;
  }

  async updateStatus(orderId:string, status:UpdateStatusDto ) {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      {status},
      {new:true}
    );
  }

  async deleteOrder(id: string) {
    return this.orderModel.findByIdAndDelete(id);
  }

  async getOrders() {
    return this.orderModel.find();
  }

  async getOrderById(orderId: string) {
    return this.orderModel.findById(orderId).populate('user');
  }
}
