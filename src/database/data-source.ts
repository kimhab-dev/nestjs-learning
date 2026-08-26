import 'dotenv/config';
import { EmailVerificationToken } from '../email-verification-token/email-verification-token.entity';
import { Order } from '../orders/entities/order-entitie';
import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import { OrderItems } from '../orders/entities/order-item.entities';
import { Product } from '../products/entities/product-entities';
import { ResetPasswordToken } from '../reset-password-token/reset-password-token.entity';
import { ChangeEmailToken } from '../change-email-token/change-email-token.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [
    User,
    Order,
    OrderItems,
    Product,
    ResetPasswordToken,
    EmailVerificationToken,
    ChangeEmailToken,
  ],

  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});
