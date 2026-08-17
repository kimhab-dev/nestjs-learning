import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @SuccessMessage('Create product successfully.')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userId = user.userId;
    return this.productsService.create(dto, userId);
  }

  @Get()
  @SuccessMessage('Get all product successfully.')
  findAll() {
    return this.productsService.findAll();
  }
}
