import { BaseEntity } from '../../database/entities/bas-entity';
import { OrderItems } from '../../orders/entities/order-item.entities';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  stock: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  image?: string;

  @ManyToOne(() => User, (user) => user.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creator_id' })
  user: User;

  @OneToMany(() => OrderItems, (orderItem) => orderItem.product)
  orderItem: OrderItems[];
}
