import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order-entitie';
import { Repository } from 'typeorm';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';

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
    return orders.map((order) => ({
      id: order.id,
      productId: order.productId,
      total: order.total,
      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
          }
        : null,
    }));
  }

  async findOne(id: number, userId: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found or not your order.');
    }
    return {
      id: order.id,
      productId: order.productId,
      total: order.total,
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
    };
  }

  async findMy(userId: number, query: GetOrdersDto) {
    const { page, limit, search, minTotal, maxTotal, sortOrder } = query;
    const skip = (page - 1) * limit;
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .where('user.id = :userId', { userId });

    // search
    if (search) {
      queryBuilder.andWhere('user.name LIKE :search', {
        search: `%${search}`,
      });
    }

    // Minimum total
    if (minTotal !== undefined) {
      queryBuilder.andWhere('order.total >= :minTotal', {
        minTotal,
      });
    }

    // Max total
    if (maxTotal !== undefined) {
      queryBuilder.andWhere('order.total <= :maxTotal', {
        maxTotal,
      });
    }

    // Sort
    queryBuilder.orderBy('order.total', sortOrder);

    // Pagination
    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();
    const data = orders.map((order) => ({
      id: order.id,
      productId: order.productId,
      total: order.total,
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
    }));
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async update(
    id: number,
    userId: number,
    dto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    // TypeScript hope function will return Something. ex: OrderResponeDto
    const order = await this.ordersRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found or not your order.');
    }
    // assign dto into order
    Object.assign(order, dto);
    const updatedOrder = await this.ordersRepository.save(order);

    // below is OrderResponseDto return to promise add function's top
    return {
      id: updatedOrder.id,
      productId: updatedOrder.productId,
      total: updatedOrder.total,
      user: {
        id: updatedOrder.user.id,
        name: updatedOrder.user.name,
        email: updatedOrder.user.email,
      },
    };
  }

  async remove(id: number, userId: number) {
    const order = await this.ordersRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found or not your order.');
    }
    await this.ordersRepository.delete(id);
  }
}
