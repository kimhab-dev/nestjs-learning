import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order-entitie';
import { Repository } from 'typeorm';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { plainToInstance } from 'class-transformer';
import { Product } from 'src/products/entities/product-entities';
import { OrderItems } from './entities/order-item.entities';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItems)
    private readonly orderItemRepository: Repository<OrderItems>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      relations: {
        user: true,
      },
    });
    return plainToInstance(OrderResponseDto, orders, {
      excludeExtraneousValues: true,
    });
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
    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
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
    return {
      items: plainToInstance(OrderResponseDto, orders, {
        excludeExtraneousValues: true,
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateOrderDto, userId: number) {

    let total = 0;
    const orderItems: OrderItems[] = [];
    for (const item of dto.items) {
      const product = await this.productRepository.findOne({
        where: {
          id: item.productId,
        },
      });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${product.name}. Available: ${product.stock}`,
        );
      }

      // -----> total price
      const subtotal = Number(product.price) * item.quantity;
      total += subtotal;

      // -----> increas and save new stock
      product.stock -= item.quantity;
      await this.productRepository.save(product);

      // -----> create order Item
      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        price: product.price,
      });

      orderItems.push(orderItem);
    }
    // -----> create order 

    const order = this.ordersRepository.create({
      user: {
        id: userId,
      },
      total,
    });
    console.log(orderItems);
    // const saveOrder = this.ordersRepository.save(order);
    for (const i of orderItems) {
      console.log(i);
    }
    // await this.orderItemRepository.save(orderItems);
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
    return plainToInstance(OrderResponseDto, updatedOrder, {
      excludeExtraneousValues: true,
    });
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
