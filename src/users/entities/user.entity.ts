import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from '../enums/role.enum';
import { Order } from 'src/orders/entities/order-entitie';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/database/entities/bas-entity';
import { Product } from 'src/products/entities/product-entities';
import { ResetPasswordToken } from 'src/reset-password-token/reset-password-token.entity';
import { EmailVerificationToken } from 'src/email-verification-token/email-verification-token.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'int',
    nullable: true, // tell database tar can oy colunm null
  })
  age: number | null; // tell typescript this field can number orr null

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  twoFactorSecret: string | null;

  @Column({ type: 'varchar', nullable: true })
  twoFactorPendingSecret: string | null;

  // () => Order : is relationship tv kan Order
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(
    () => ResetPasswordToken,
    (resetPasswordToken) => resetPasswordToken.user,
  )
  resetPasswordToken: ResetPasswordToken[];

  @OneToMany(
    () => EmailVerificationToken,
    (emailVerificationToken) => emailVerificationToken.user,
  )
  emailVerificationTokens: EmailVerificationToken[];
}
