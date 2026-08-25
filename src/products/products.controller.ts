import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  getRelativeFilePath,
  multerUploadOptions,
} from 'src/common/helpers/file-upload.helper';
import { ApiConsumes } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerUploadOptions({ destination: 'products' })),
  )
  @ApiConsumes('multipart/form-data', 'application/json')
  @SuccessMessage('Create product successfully.')
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.productsService.create(dto, userId, file);
  }

  // POST /products/upload-image — upload standalone product image file
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', multerUploadOptions({ destination: 'products' })),
  )
  @ApiConsumes('multipart/form-data')
  @SuccessMessage('Upload product image successfully.')
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }
    return {
      path: getRelativeFilePath(file, 'products'),
    };
  }

  // POST /products/:id/image — upload and attach image to existing product
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', multerUploadOptions({ destination: 'products' })),
  )
  @ApiConsumes('multipart/form-data')
  @SuccessMessage('Product image updated successfully.')
  uploadProductImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }
    return this.productsService.uploadProductImage(id, file);
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

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', multerUploadOptions({ destination: 'products' })),
  )
  @ApiConsumes('multipart/form-data', 'application/json')
  @SuccessMessage('Update product successfully.')
  patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.updateProduct(id, dto, file);
  }

  // PATCH /products/:id/stock — add stock quantity to the product
  @Patch(':id/stock')
  @SuccessMessage('Stock added successfully.')
  addStock(@Param('id', ParseIntPipe) id: number, @Body() dto: AddStockDto) {
    return this.productsService.addStock(id, dto);
  }

  // DELETE /products/:id
  @Delete(':id')
  @SuccessMessage('Delete product successfully.')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
