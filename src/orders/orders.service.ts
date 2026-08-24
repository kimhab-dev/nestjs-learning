import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order-entitie';
import { DataSource, Repository } from 'typeorm';
import { OrderItemResponseDto, OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';
import { plainToInstance } from 'class-transformer';
import { Product } from 'src/products/entities/product-entities';
import { OrderItems } from './entities/order-item.entities';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItems)
    private readonly orderItemRepository: Repository<OrderItems>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly telegramService: TelegramService,
    private readonly dataSource: DataSource,
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

  async findOne(id: Order, userId: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: {
        items: {
          order: id,
        },
        user: {
          id: userId,
        },
      },
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found or not your order.');
    }
    console.dir(order, { depth: null });
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

  async create(
    dto: CreateOrderDto,
    userId: number,
  ): Promise<OrderItemResponseDto[]> {
    // Use a transaction so stock deductions and order creation are atomic.
    // If anything fails mid-loop, all DB changes are rolled back automatically.
    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const orderItems: OrderItems[] = [];

      for (const item of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for ${product.name}. Available: ${product.stock}`,
          );
        }

        // ----->total price
        const subtotal = Number(product.price) * item.quantity;
        total += subtotal;

        // ----->decrement stock atomically
        await manager.decrement(
          Product,
          { id: product.id },
          'stock',
          item.quantity,
        );

        // ----->prepare order item (not saved yet)
        const orderItem = manager.create(OrderItems, {
          product,
          quantity: item.quantity,
          price: product.price,
        });
        orderItems.push(orderItem);
      }

      // ----->create and save order
      const order = manager.create(Order, {
        user: { id: userId },
        total,
      });
      const savedOrder = await manager.save(Order, order);

      // ----->link order items to the saved order and save them
      for (const orderItem of orderItems) {
        orderItem.order = savedOrder;
      }
      const resOrderItems = await manager.save(OrderItems, orderItems);

      // ----->send Telegram notification
      let headerMessage = `🛒 New Order #${savedOrder.id}\n`;
      for (const item of resOrderItems) {
        headerMessage += `• ${item.product.name} x${item.quantity} @ $${item.price}\n`;
      }
      headerMessage += `Total: $${total}`;
      await this.telegramService.sendMessage(headerMessage);

      return plainToInstance(OrderItemResponseDto, resOrderItems, {
        excludeExtraneousValues: true,
      });
    });
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
