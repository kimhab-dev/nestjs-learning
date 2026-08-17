import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: 'PRODUCT_STATUS',
      useValue: 'active',
    },
  ],
})
export class ProductsModule {}
