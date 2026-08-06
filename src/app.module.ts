import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [AppController, UsersController], // register controller
  providers: [AppService, UsersService], // register service
})
export class AppModule implements NestModule {
  //init middleware into route
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('users');
    consumer.apply(LoggerMiddleware).forRoutes('products');
    consumer.apply(LoggerMiddleware).forRoutes('orders');
  }
}
