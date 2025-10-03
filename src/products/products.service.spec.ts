import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from '../schemas/Product.schema';
import { Model } from 'mongoose';
import { buffer } from 'stream/consumers';

const fakeProduct = {
  _id: 'abc123',
  name: "Bed",
  description: "A very big Bed",
  price: "150.99",
  category: "Bed Room",
  images: [
    {
      url: ' old-url',
      public_id: 'old-id'
    }
  ],
  stock: "20",
  status: "In Stock",      
  features: ["very big", "very strong", "wooden"],
  save: jest.fn(),
}

const mockProductModel = {
  findById: jest.fn().mockResolvedValue(fakeProduct),
  findByIdAndUpdate: jest.fn().mockImplementation((id, dto) => ({ ...fakeProduct,id, ...dto, }))
} as unknown as Model<Product>

const mockCloudinary = {
    uploader: {
      upload_stream: jest.fn().mockResolvedValue({
        public_id: 'new_img_id',
        secure_url: "http://cloudinary.com/new_img.jpg",
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok'}),
    },
  };



describe('ProductsService', () => {
  let service: ProductsService;
  

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new ProductsService(mockProductModel, mockCloudinary as any);
  });

  it('should upload images and save product', async() => {
    const dto = {
        name: "Chair",
        description: "A very big chair",
        price: "200.99",
        category: "Living Room",
        stock: "20",
        status: "In Stock",      
        features: ["very big", "very strong", "wooden"]
    }
    const files: any =[{buffer: Buffer.from('fake')}];
    const result = await service.createProduct(dto, files);

    expect(result.images[0].url).toBe('http://cloudinary.com/new_img.jpg');
    expect(result.images[0].public_id).toBe('new_img_id');
  });

  it('should delete old images and save new product', async () => {
    const dto = {
        name: "Chair",
        description: "A very big chair",
        price: "200.99",
        category: "Living Room",
        stock: "20",
        status: "In Stock",      
        features: ["very big", "very strong", "wooden"]
    }
    const Id = "abc123"
    const files: any =[{buffer: Buffer.from('fake')}];
    const result = await service.editProduct(Id ,dto, files);

    expect(mockProductModel.findById).toHaveBeenCalledWith(Id);
    expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith('old-id', expect.any(Function));
    expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalled();
    expect(result?.name).toBe('Chair');
    expect(result?.images[0].url).toBe('mock-url');
  });
});
