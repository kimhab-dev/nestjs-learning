import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from '../enums/role.enum';
import { Order } from '../../orders/entities/order-entitie';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../database/entities/bas-entity';
import { Product } from '../../products/entities/product-entities';
import { ResetPasswordToken } from '../../reset-password-token/reset-password-token.entity';
import { EmailVerificationToken } from '../../email-verification-token/email-verification-token.entity';
import { ChangeEmailToken } from '../../change-email-token/change-email-token.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'int',
    nullable: true, // tell database tar can oy colunm null
  })
  age: number | null; // tell typescript this field can number orr null

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret: string | null;

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

  @OneToMany(
    () => ChangeEmailToken,
    (changeEmailToken) => changeEmailToken.user,
  )
  changeEmailTokens: ChangeEmailToken[];
}
