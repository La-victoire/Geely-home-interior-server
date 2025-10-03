import { Body, Controller, Delete, ForbiddenException, Get, HttpException, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateProductDto } from './dto/CreateProduct.dto';
import { ProductsService } from './products.service';
import { Roles } from 'src/users/strategies/roles.decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt.guard';
import { RolesGuard } from 'src/users/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';

@Controller('products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @Post()
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 5)) // max 5 files
  async createProduct(@Body() createProductDto: CreateProductDto, @UploadedFiles() files: Express.Multer.File[],) {
    const product = await this.productService.createProduct(createProductDto, files)
    return product;
  }

  @Get(":id")
  async getOneProduct(@Param('id') id:string) {
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if (!isValid) 
      throw new ForbiddenException('Invalid ID')
    return await this.productService.getOneProduct(id);
  }

  @Get()
  async getProducts() {
    const products = await this.productService.getProducts();
    if (!products[0])
      throw new HttpException('No Products Available', 404)
    else {
      return products
    }
  };

  @Patch(':id')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 5)) // max 5 files
  async editProducts(@Body() createProductDto:CreateProductDto, @UploadedFiles() files: Express.Multer.File[], @Param("id") id:string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
      if (!isValid ) 
        throw new HttpException('Invalid ID', 404);
    const products = await this.productService.editProduct(id,createProductDto,files);
    return products
  };
  
  @Delete(':id')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteProduct(@Param('id') id:string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
      if (!isValid ) 
        throw new HttpException('Invalid ID', 404);
    const product = await this.productService.deleteProduct(id);
    return { message: 'Product Deleted Successfully', product}
  }

  @Delete()
  @Roles('Admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteAllProduct() {
    await this.productService.deleteAllProducts();
    return { message: 'Products Cleared Successfully'}
  }
}