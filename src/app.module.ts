import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './logger/logger.middleware';
import { CurrentTimeMiddleware } from './logger/currentime.middleware';
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
    // -----> optoin 1 : use by endpoint and method
    // consumer
    //   .apply(LoggerMiddleware) // nest tell coulde using LoggerMiddleware to apply all route
    //   .forRoutes({ path: 'users', method: RequestMethod.GET });

    // -----> optoin 2 : apply all route in usersController. tus bey yg change endpoint kor vea nv der. recommand by nestjs
    // consumer
    //   .apply(LoggerMiddleware) // nest tell coulde using LoggerMiddleware to apply all route
    //   .forRoutes(UsersController);

    // -----> optoin 2 : apply all route leark leng tah route yg jong tuk.
    consumer
      .apply(LoggerMiddleware, CurrentTimeMiddleware)
      .exclude({
        path: 'users',
        method: RequestMethod.GET,
      })
      .forRoutes('*');

  }
}
