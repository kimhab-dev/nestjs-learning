import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @SuccessMessage('Create product successfully.')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.productsService.create(dto, userId);
  }

  @Get()
  @SuccessMessage('Get all product successfully.')
  findAll() {
    return this.productsService.findAll();
  }

  // GET /products/my — must be declared BEFORE /:id so it isn't matched as an id
  @Get('/my')
  @SuccessMessage('Get my products successfully.')
  findByOwner(@CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.productsService.findByOwner(userId);
  }

  // GET /products/:id
  @Get(':id')
  @SuccessMessage('Get product successfully.')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(id);
  }

  // DELETE /products/:id — only the owner can delete
  @Delete(':id')
  @SuccessMessage('Delete product successfully.')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.productsService.remove(id, userId);
  }
}

