import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product-entities';
import { ProductImage } from './entities/productImage-entities';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductResponseDto } from './dto/response-product.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddStockDto } from './dto/add-stock.dto';
import {
  getRelativeFilePath,
  removeUploadedFile,
} from '../common/helpers/file-upload.helper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
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
      category: { id: dto.category_id },
      stock: dto.stock,
      year: dto.year,
      engince: dto.engince,
      color: dto.color,
      user: { id: userId },
    });
    const saved = await this.productsRepository.save(product);
    return this.findById(saved.id);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.find({
      relations: { user: true, category: true, hightLightImage: true },
      order: {
        createdAt: 'DESC',
        hightLightImage: {
          sortOrder: 'ASC',
        },
      },
    });
    return plainToInstance(ProductResponseDto, products, {
      excludeExtraneousValues: true,
    });
  }

  // GET /products/:id — find a single product by its id
  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { user: true, category: true, hightLightImage: true },
      order: {
        hightLightImage: {
          sortOrder: 'ASC',
        },
      },
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
      relations: { user: true, category: true, hightLightImage: true },
      order: {
        hightLightImage: {
          sortOrder: 'ASC',
        },
      },
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
      relations: { user: true, hightLightImage: true },
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

    await this.productsRepository.save(product);

    // If new image was uploaded and differed from old one, delete old file from disk
    if (file && oldImage && oldImage !== newImage) {
      removeUploadedFile(oldImage);
    }

    return this.findById(productId);
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
    return this.findById(productId);
  }

  // Upload up to 4 images for a product
  async uploadProductImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: { hightLightImage: true },
    });

    if (!product) {
      files.forEach((file) => removeUploadedFile(file.path));
      throw new NotFoundException('Product not found.');
    }

    const currentImages = product.hightLightImage ?? [];
    const MAX_IMAGES = 4;

    if (currentImages.length + files.length > MAX_IMAGES) {
      files.forEach((file) => removeUploadedFile(file.path));
      throw new BadRequestException(
        `Cannot upload ${files.length} images. Product already has ${currentImages.length} images (maximum is ${MAX_IMAGES}).`,
      );
    }

    const hasPrimary = currentImages.some((img) => img.isPrimary);

    console.log(files);
    
    const newImages = files.map(async (file, index) => {
      const isPrimary = !hasPrimary && index === 0;
      const newImages = await this.productImagesRepository.create({
        imageUrl: getRelativeFilePath(file, 'products'),
        sortOrder: currentImages.length + index,
        isPrimary,
        product: { id: productId },
      });
      return await this.productImagesRepository.save(newImages);
    });

    return this.findById(productId);
  }

  // Upload single product image (for backwards compatibility)
  async uploadProductImage(
    productId: number,
    file: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    return this.uploadProductImages(productId, [file]);
  }

  // Delete a specific product image
  async deleteProductImage(
    productId: number,
    imageId: number,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: { hightLightImage: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    const imageToDelete = product.hightLightImage?.find((img) => img.id === imageId);
    if (!imageToDelete) {
      throw new NotFoundException('Product image not found.');
    }

    removeUploadedFile(imageToDelete.imageUrl);
    await this.productImagesRepository.delete(imageId);

    const remainingImages = (product.hightLightImage || []).filter(
      (img) => img.id !== imageId,
    );

    if (imageToDelete.isPrimary) {
      if (remainingImages.length > 0) {
        remainingImages[0].isPrimary = true;
        await this.productImagesRepository.save(remainingImages[0]);
        product.image = remainingImages[0].imageUrl;
      } else {
        product.image = undefined;
      }
      await this.productsRepository.save(product);
    }

    return this.findById(productId);
  }

  // DELETE /products/:id — delete a product and clean up all images
  async remove(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { user: true, hightLightImage: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    if (product.image) {
      removeUploadedFile(product.image);
    }

    if (product.hightLightImage && product.hightLightImage.length > 0) {
      for (const img of product.hightLightImage) {
        removeUploadedFile(img.imageUrl);
      }
    }

    await this.productsRepository.delete(id);
  }
}
