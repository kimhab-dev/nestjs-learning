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
import { Public } from 'src/common/decorators/public.decorator';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --------> first controller - testing
  // @Get()
  // findAll() {
  //   return 'Get all users ';
  // }

  // @Get('profile')
  // profile(): string {
  //   return 'Get profile';
  // }

  // @Post()
  // createUser(): string {
  //   return 'Create User';
  // }

  // @Get(':id')
  // findOne(
  //   @Param('id') id: number,
  //   @Query('page') page: string,
  //   @Query('limit') limit: string,
  // ) {
  //   return 'user : ' + id + ', page : ' + page + ', limit : ' + limit;
  // }

  // @Post(':id/post/:proposalId')
  // createOne(@Param('id') id: number, @Param('proposalId') proposalId: number) {
  //   return 'Posted user : ' + id + ', Proposal Id : ' + proposalId;
  // }

  // -----> normal post
  // @Post()
  // create(@Body('name') name: string, @Body('email') email: string) {
  //   return `Hello ${name}`;
  // }

  // -----> using interfac or class
  // class CreateUserDto {
  //   name: string;
  //   email: string;
  //   password: string;
  // }

  // ------> with DI - inject service
  @Post()
  // @Public()
  // @UseGuards(AuthGuard)
  @SuccessMessage('Create user success.')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @SuccessMessage('Get all user success.')
  @Public()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.usersService.findAll();
  }

  @Get(':id')
  // @UseFilters(HttpException)
  @SuccessMessage('Get user success.')
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
    return this.usersService.findOne(id);;
  }

  @Put(':id')
  @SuccessMessage('Update user success.')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @SuccessMessage('Delete use success.')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
