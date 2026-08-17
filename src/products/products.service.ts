import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product-entities';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductResponseDto } from './dto/response-product.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>
  ) {}
  async create(dto: CreateProductDto, userId): Promise<ProductResponseDto> {
    const isProduct = await this.productsRepository.findOne({
      where: {
        name: dto.name,
      },
    });
    if (isProduct) {
      throw new ConflictException('This product is already have.');
    }
    const product = this.productsRepository.create({
      name: dto.name,
      price: dto.price,
      description: dto.description,
      stock: dto.stock,
      user: {
        id: userId,
      },
    });
    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.find({
      relations: {
        user: true,
      },
    });
    return plainToInstance(ProductResponseDto, products, {
      excludeExtraneousValues: true,
    });
  }
}
