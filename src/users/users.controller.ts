import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
  create(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }

  @Get()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    console.log(page);
    console.log(limit);
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: number,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    console.log(id, page, limit);
    return this.usersService.findOne(id);
  }
}
