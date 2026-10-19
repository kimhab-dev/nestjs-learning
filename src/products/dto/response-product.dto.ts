import { Expose, Type } from 'class-transformer';
import { UsersResponseDto } from '../../users/dto/user-response.dto';
import { CategoryResponseDto } from 'src/categories/dto/category-response.dto';

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
}
