import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetOrdersDto } from './dto/get-orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @SuccessMessage('Get all order successfully.')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('/my')
  @SuccessMessage('Get my order successfully.')
  findMy(@CurrentUser() user: any, @Query() query: GetOrdersDto) {
    return this.ordersService.findMy(user.userId, query);
  }

  @Get(':id')
  @SuccessMessage('Get a order successfully.')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    return this.ordersService.findOne(id, userId);
  }

  @Post()
  @SuccessMessage('Order product successfully.')
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    return this.ordersService.create(dto, userId);
  }

  @Patch(':id')
  @SuccessMessage('Update order successfully.')
  update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.ordersService.update(id, userId, dto);
  }

  @Delete(':id')
  @SuccessMessage('Delete order successfully.')
  remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.ordersService.remove(id, userId);
  }
}
