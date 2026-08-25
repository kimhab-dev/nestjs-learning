import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  total?: number;
}
