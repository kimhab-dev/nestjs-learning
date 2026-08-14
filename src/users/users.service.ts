import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const findByEmail = await this.usersRepository.findBy({ email: dto.email });
    if (findByEmail.length > 0) {
      throw new ConflictException('The email aready in use.');
    }
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      age: dto.age,
    });
    return await this.usersRepository.save(user);
  }

  async findAll() {
    const users = await this.usersRepository.find();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = users.map(({ password, ...user }) => user);
    return result;
  }

  async findOne(id) {
    const user = await this.usersRepository.find({
      where: {
        id,
      },
    });
    if (user.length === 0) {
      throw new NotFoundException('User not found.');
    }
    return user[0];
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.preload({
      id,
      ...dto,
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const findByEmail = await this.usersRepository.findBy({ email: dto.email });
    if (findByEmail.length > 0) {
      throw new ConflictException('The email aready in use.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, role, ...result } = user;
    return this.usersRepository.save(result);
  }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found.');
    }
  }
}
