import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './logger/logger.middleware';
import { CurrentTimeMiddleware } from './logger/currentime.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ProductsModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [AppController], // register controller
  providers: [AppService], // register service
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
