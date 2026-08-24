import { Expose, Transform, Type } from 'class-transformer';
import { UsersResponseDto } from 'src/users/dto/user-response.dto';

export class OrderItemResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.id)
  orderItemId: number;

  @Expose()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  @Transform(({ obj }) => obj.product?.name)
  productName: string;

  @Expose()
  @Transform(({ obj }) => obj.product?.price)
  price: string;

  @Expose()
  quantity: number;
}

export class OrderResponseDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  total: number;

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];

  @Expose()
  @Type(() => UsersResponseDto)
  user: UsersResponseDto | null;

  @Expose()
  createdAt: Date;
}
