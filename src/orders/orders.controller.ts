import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { InitiateOrderDto } from './dto/InitiateOrder.dto';
import mongoose from 'mongoose';
import { UpdateStatusDto } from './dto/UpdateStatus.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  // Create order
  @Post()
  @UsePipes(new ValidationPipe())
  async initateOrder(@Body() initiateOrderDto: InitiateOrderDto) {
    return this.orderService.initiateOrder(initiateOrderDto);
  }

  // Update Order Status
  @Patch(':id/ship')
  @UsePipes(new ValidationPipe())
  async updateStatus(@Param('id') id:string, @Body() dto: UpdateStatusDto) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid ) 
      throw new HttpException('Invalid ID', 404);
    return this.orderService.updateStatus(id, dto)
  }

  // Update payment (Paystack webhook)
  @Patch(":id/payment")
  async updatePayment(@Param("id") id:string, @Body() paymentData: any) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid ) 
      throw new HttpException('Invalid ID', 404);
    const updatedOrder = await this.orderService.updatePayment(id, paymentData);
    if (!updatedOrder) 
      throw new HttpException('Order not found', 404)
    return updatedOrder
  }

  // Get all orders
  @Get()
  getOrders() {
    return this.orderService.getOrders();
  }

  // Get single order
  @Get(':id')
  async getOrderById(@Param("id") id:string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid ) 
      throw new HttpException('Order does not exist', 404);
    const findOrder = await this.orderService.getOrderById(id);
    if (!findOrder) throw new HttpException("Order not found", 404);
    return findOrder;
  }

  @Delete(':id')
  async deleteUser(@Param("id") id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid ) 
      throw new HttpException('Invalid ID', 404);
    const deletedUser = await this.orderService.deleteOrder(id);
    if (!deletedUser) 
      throw new HttpException('Order does not exist in database', 404)
    return;
  }
}
