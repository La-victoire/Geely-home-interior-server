import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateCartDto } from './dto/UpdateCart.dto';
import { randomUUID } from 'crypto';
import { User } from 'src/schemas/User.schema';
import { CartItemDto } from './dto/CartItem.dto';
import { Types } from 'mongoose';
import { Product } from 'src/schemas/Product.schema';

@Injectable()
export class CartsService {
  constructor(
  @InjectModel(User.name) private userModel: Model<User>,
  @InjectModel(Product.name) private productModel: Model<Product>
) {}
  async addToCart(userId: string, dto:CartItemDto) {
  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException('User Not Found');

  // Check if product exists
  const product = await this.productModel.findById(dto.product);
  if (!product) throw new NotFoundException('Product not found')
  
  // Check if item already exists in cart
  const existingItemIndex = user.cart.findIndex(
    item => item.product.toString() === dto.product
  );
  if (existingItemIndex > -1) {
    // Update Quantity if item exists
    user.cart[existingItemIndex].quantity += dto.quantity
  } else {
    // Add new item to cart
    user.cart.push({
      product: new Types.ObjectId(dto.product),
      quantity: dto.quantity,
      price: dto.price,
      productId: randomUUID()
    });
  }
  return await user.save();
  }

  async getCart(userId: string) {
    return await this.userModel.findById(userId).populate('cart.product','name stock image').exec()
  }

  async updateItem(userId: string, productId: string, dto:UpdateCartDto) {
    const user = await this.userModel.findById(userId)
    if (!user) throw new NotFoundException('User Not Found');
    const item = user.cart.find((i) =>  i.productId && i.productId.toString() === productId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    } 
    item.quantity = dto.quantity
    return await user.save();
  }

  async removeFromCart(userId: string, productId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Cart Not Found');

    user.cart = user.cart.filter((i)=> i.productId !== productId);
    return await user.save();
  }

  async clearCart(userId: string) {
    return await this.userModel.findByIdAndUpdate(
       userId,
      {cart: [] },
      { new: true }
    );
  }
}
