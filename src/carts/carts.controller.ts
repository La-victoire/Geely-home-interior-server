import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/users/guards/jwt.guard';
import { UpdateCartDto } from './dto/UpdateCart.dto';
import { ArcjetGuard, shield, WithArcjetRules } from '@arcjet/nest';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartService: CartsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addToCart(@Req() req, @Body() item: any) {
    return this.cartService.addToCart(req.user?.sub, item)
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ArcjetGuard)
  // Attaches the rule to this controller
  @Get()
  async getCart(@Req() req) {
    return this.cartService.getCart(req.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:productId')
  async updateItem(@Req() req, @Param('productId') productId: string, @Body() dto:UpdateCartDto) {
    return this.cartService.updateItem(req.user.sub, productId, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async removeFromCart(@Req() req, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user?.sub, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user?.sub);
  }
}
