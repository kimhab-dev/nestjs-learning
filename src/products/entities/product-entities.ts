import { BaseEntity } from 'src/database/entities/bas-entity';
import { OrderItems } from 'src/orders/entities/order-item.entities';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column()
  description: string;

  @Column()
  stock: number;

  @Column({ nullable: true })
  image?: string;

  @Column({nullable: true})
  test?: string;

  @ManyToOne(() => User, (user) => user.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creator_id' })
  user: User;

  @OneToMany(() => OrderItems, (orderItem) => orderItem.product)
  orderItem: OrderItems[];
}
