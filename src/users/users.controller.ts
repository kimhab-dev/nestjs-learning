import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

import { AuthGuard } from 'src/auth/auth.guard';
import { JWTAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Public } from 'src/common/decorators/public.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from './enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ------> with DI - inject service
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @SuccessMessage('Create user success.')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @SuccessMessage('Get all user successfully.')
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.usersService.findAll();
  }

  @Get(':id')
  // @UseFilters(HttpException)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @SuccessMessage('Get user successfully.')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('active', ParseBoolPipe) active: boolean,
  ) {
    // if (!id) {
    //   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    // }
    // throw new BadRequestException();
    // console.log(id, page, limit, active);
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @SuccessMessage('Update user successfully.')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @SuccessMessage('Delete use successfully.')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
