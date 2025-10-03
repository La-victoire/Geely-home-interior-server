import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, productSchema } from 'src/schemas/Product.schema';
import { ProductsService } from './products.service';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import multer from 'multer';

@Module({
  imports: [
      MongooseModule.forFeature([{
        name: Product.name,
        schema: productSchema,
      }
    ]),
      MulterModule.register({
          storage: multer.memoryStorage(),
          fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
              return callback(new Error('Only image files are allowed!'), false)
            }
            callback(null, true);
          },
        }),
  ],
  providers: [ProductsService,CloudinaryProvider],
  controllers: [ProductsController]
})
export class ProductsModule {}
