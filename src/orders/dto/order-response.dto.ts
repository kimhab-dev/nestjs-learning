import { Expose, Type } from 'class-transformer';
import { UsersResponseDto } from 'src/users/dto/user-response.dto';

export class OrderResponseDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  total: number;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UsersResponseDto)
  user: UsersResponseDto | null;
}
