import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order-entitie';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}
  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      relations: {
        user: true,
      },
    });
    console.log(orders);
    return orders.map((order) => ({
      id: order.id,
      productId: order.productId,
      total: order.total,
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
    }));
  }

  async create(dto: CreateOrderDto, userId: number) {
    const order = this.ordersRepository.create({
      productId: dto.productId,
      total: dto.total,
      user: {
        id: userId,
      },
    });
    return await this.ordersRepository.save(order);
  }
}
