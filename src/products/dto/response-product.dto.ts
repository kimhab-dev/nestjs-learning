import { Expose, Type } from 'class-transformer';
import { UsersResponseDto } from '../../users/dto/user-response.dto';

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
  image: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UsersResponseDto)
  user: UsersResponseDto;
}
