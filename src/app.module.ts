import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from './auth/guards/jwt-auth.guard';
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
import { TelegramModule } from './telegram/telegram.module';

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
    TelegramModule,
  ],
  controllers: [AppController], // register controller
  providers: [
    AppService,
    {
      provide: APP_GUARD, // register guaed to global for not write @UserGuard() any ware
      useClass: JWTAuthGuard, // class for
    },
  ],
  // register service
})
export class AppModule implements NestModule {
  //init middleware into route
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, CurrentTimeMiddleware)
      .exclude({
        path: 'users',
        method: RequestMethod.GET,
      })
      .forRoutes('*');
  }
}
