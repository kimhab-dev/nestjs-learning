import { Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class ProductImageResponseDto {
  @Expose()
  id: number;

  @Expose()
  imageUrl: string;

  @Expose()
  sortOrder: number;

  @Expose()
  isPrimary: boolean;

  @Expose()
  productId: number;

  @Expose()
  createdAt: Date;
}

export class ProductResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  stock: number;

  @Expose()
  description: string;

  @Expose()
  year: number;

  @Expose()
  engince: number;

  @Expose()
  color: string;

  @Expose()
  image: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;

  @Expose()
  @Type(() => ProductImageResponseDto)
  images: ProductImageResponseDto[];
}
