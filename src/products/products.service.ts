import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/Product.schema';
import { CreateProductDto } from './dto/CreateProduct.dto';
import { v2 as Cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>,
  @Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary
) {}

  async uploadToCloudinary(file:Express.Multer.File): Promise<object> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve({
            url: result?.secure_url,
            public_id: result?.public_id
          });
        },
      );

      // convert buffer into a stream and pipe to cloudinary
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async createProduct(createProductDto: CreateProductDto, files: Express.Multer.File[]): Promise<Product> {
    const imageURLs = await Promise.all(
      files.map(file => this.uploadToCloudinary(file)),
    );
    
    const newProduct = new this.productModel({...createProductDto, images: imageURLs});
    return await newProduct.save();
  }

  async editProduct(productId:string, editProductDto: CreateProductDto, files: Express.Multer.File[]) {
    const existingProduct = await this.productModel.findById(productId)
    if (!existingProduct) 
      throw new NotFoundException('Product Not Found')

    existingProduct.images.map((img) => this.cloudinary.uploader.destroy(img.public_id))
    const imageURLs : object[] = await Promise.all(
      files.map(file => this.uploadToCloudinary(file)),
    );
    return await this.productModel
    .findByIdAndUpdate(
      productId,
      {...editProductDto, images: imageURLs},
      {new : true},
    );
  }

  async getProducts() {
    return this.productModel.find();
  }

  async getOneProduct(productId:string) {
    const existingProduct = await this.productModel.findById(productId)
    if (!existingProduct) 
      throw new NotFoundException('Product Not Found')
    return existingProduct
  }
  async deleteProduct(productId:string) {
    const existingProduct = await this.productModel.findById(productId)
    if (!existingProduct) 
      throw new NotFoundException('Product Not Found')

    existingProduct.images.map((img) => this.cloudinary.uploader.destroy(img.public_id))
   return await this.productModel.findByIdAndDelete(productId)
  }
  async deleteAllProducts() {
    const existingProduct = await this.productModel.find()
    if (!existingProduct) 
      throw new NotFoundException('No Products Existing')
    existingProduct.map((prod) => (prod.images.map((img) => this.cloudinary.uploader.destroy(img.public_id))))
    await this.productModel.deleteMany()    
  }
}
