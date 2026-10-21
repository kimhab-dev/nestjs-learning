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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SuccessMessage } from '../common/decorators/success-message.decorator';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerUploadOptions } from '../common/helpers/file-upload.helper';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

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

  // POST /products/:id/images — upload up to 4 images for a product
  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor(
      'images',
      4,
      multerUploadOptions({ destination: 'products' }),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Upload up to 4 product image files',
        },
      },
    },
  })
  @SuccessMessage('Product images uploaded successfully.')
  uploadProductImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required.');
    }
    return this.productsService.uploadProductImages(id, files);
  }

  // POST /products/:id/image — upload and attach single image to existing product
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

  // PATCH /products/:id/images/:imageId/primary — set an image as primary
  @Patch(':id/images/:imageId/primary')
  @SuccessMessage('Primary product image updated successfully.')
  setPrimaryProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.productsService.setPrimaryProductImage(id, imageId);
  }

  // DELETE /products/:id/images/:imageId — delete specific product image
  @Delete(':id/images/:imageId')
  @SuccessMessage('Product image deleted successfully.')
  deleteProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.productsService.deleteProductImage(id, imageId);
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
