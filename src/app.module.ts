import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { TwoFactorModule } from './two-factor/two-factor.module';
import { ChatGateway } from './chat/chat.gateway';
import { MailModule } from './mail/mail.module';
import Joi from 'joi';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        SECRET_KEY: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      autoLoadEntities: true,
      synchronize: false, // recoment false in production
    }),
    AuthModule,
    ProductsModule,
    OrdersModule,
    UsersModule,
    TelegramModule,
    TwoFactorModule,
    MailModule,
  ],
  controllers: [AppController], // register controller
  providers: [
    AppService,
    {
      provide: APP_GUARD, // register guaed to global for not write @UserGuard() any ware
      useClass: JWTAuthGuard, // class for
    },
    {
      provide: APP_GUARD, // register guaed to global for not write @UserGuard() any ware
      useClass: ThrottlerGuard, // class for
    },
    ChatGateway,
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
