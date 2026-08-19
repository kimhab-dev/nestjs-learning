import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order-entitie';
import { OrderItems } from './entities/order-item.entities';
import { Product } from 'src/products/entities/product-entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItems, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
