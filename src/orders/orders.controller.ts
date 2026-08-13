import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  @SuccessMessage('Get all order successfully.')
  findAll() {
    return this.ordersService.findAll();
  }
  @Get(':id')
  @SuccessMessage('Get a order successfully.')
  findOne() {
    // return this.ordersService
  }

  @Post()
  @SuccessMessage('Create product successfully.')
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    return this.ordersService.create(dto, userId);
  }
}
