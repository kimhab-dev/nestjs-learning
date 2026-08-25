import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product-entities';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductResponseDto } from './dto/response-product.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddStockDto } from './dto/add-stock.dto';
import {
  getRelativeFilePath,
  removeUploadedFile,
} from 'src/common/helpers/file-upload.helper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(
    dto: CreateProductDto,
    userId: number,
  ): Promise<ProductResponseDto> {
    const isProduct = await this.productsRepository.findOne({
      where: { name: dto.name },
    });
    if (isProduct) {
      throw new ConflictException('This product is already have.');
    }

    const product = this.productsRepository.create({
      name: dto.name,
      price: dto.price,
      description: dto.description,
      stock: dto.stock,
      user: { id: userId },
    });
    const saved = await this.productsRepository.save(product);
    return plainToInstance(ProductResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.find({
      relations: { user: true },
    });
    return plainToInstance(ProductResponseDto, products, {
      excludeExtraneousValues: true,
    });
  }

  // GET /products/:id — find a single product by its id
  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  // GET /products/my — get all products owned by the current user
  async findByOwner(userId: number): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.find({
      where: { user: { id: userId } },
      relations: { user: true },
    });
    return plainToInstance(ProductResponseDto, products, {
      excludeExtraneousValues: true,
    });
  }

  async updateProduct(
    productId: number,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: {
        id: productId,
      },
      relations: { user: true },
    });

    if (!product) {
      if (file) {
        removeUploadedFile(file.path);
      }
      throw new NotFoundException('Product not found.');
    }

    const oldImage = product.image;
    let newImage = dto.image;

    if (file) {
      newImage = getRelativeFilePath(file, 'products');
    }

    Object.assign(product, {
      ...dto,
      ...(newImage !== undefined && { image: newImage }),
    });

    const saved = await this.productsRepository.save(product);

    // If new image was uploaded and differed from old one, delete old file from disk
    if (file && oldImage && oldImage !== newImage) {
      removeUploadedFile(oldImage);
    }

    return plainToInstance(ProductResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async addStock(
    productId: number,
    dto: AddStockDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: { user: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    await this.productsRepository.increment(
      { id: productId },
      'stock',
      dto.quantity,
    );
    const updated = await this.productsRepository.findOne({
      where: { id: productId },
      relations: { user: true },
    });
    return plainToInstance(ProductResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async uploadProductImage(
    productId: number,
    file: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: { user: true },
    });

    if (!product) {
      removeUploadedFile(file.path);
      throw new NotFoundException('Product not found.');
    }

    const oldImage = product.image;
    product.image = getRelativeFilePath(file, 'products');

    const saved = await this.productsRepository.save(product);

    if (oldImage && oldImage !== product.image) {
      console.log("remove");
      removeUploadedFile(oldImage);
    }

    return plainToInstance(ProductResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  // DELETE /products/:id — delete a product, only if the requester owns it
  async remove(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (product.image) {
      removeUploadedFile(product.image);
    }

    await this.productsRepository.delete(id);
  }
}
