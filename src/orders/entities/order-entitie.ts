import { BaseEntity } from '../../database/entities/bas-entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderItems } from './order-item.entities';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: number;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'order_by' })
  user: User;
  @OneToMany(() => OrderItems, (orderItem) => orderItem.order)
  items: OrderItems[];
}
