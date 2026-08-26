import { BaseEntity } from '../../database/entities/bas-entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order-entitie';
import { Product } from '../../products/entities/product-entities';

@Entity('order_items')
export class OrderItems extends BaseEntity {
  @Column()
  quantity: number;

  @Column()
  price: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItem, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
