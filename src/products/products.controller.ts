import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
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
  @Public()
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

  @Public()
  // GET /products/:id
  @Get(':id')
  @SuccessMessage('Get product successfully.')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(id);
  }

  @SuccessMessage('Update product successfully.')
  patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  // PATCH /products/:id/stock — add stock quantity to the product
  @Patch(':id/stock')
  @SuccessMessage('Stock added successfully.')
  addStock(@Param('id', ParseIntPipe) id: number, @Body() dto: AddStockDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.productsService.addStock(id, dto);
  }

  // DELETE /products/:id — only the owner can delete
  @Delete(':id')
  @SuccessMessage('Delete product successfully.')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.productsService.remove(id);
  }
}