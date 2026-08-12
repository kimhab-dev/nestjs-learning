import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';

import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const findByEmail = await this.usersRepository.findBy({ email: dto.email });
    if (findByEmail.length > 0) {
      throw new ConflictException('The email aready in use.');
    }

    const hashPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashPassword,
    });
    const saveUser = await this.usersRepository.save(user);
    const { password, age, role, ...result } = saveUser;
    return result;
  }

  async login(dto: LoginDto) {
    const [findByEmail] = await this.usersRepository.findBy({
      email: dto.email,
    });
    if (!findByEmail) {
      throw new NotFoundException('Invalid username or password.');
    }
    const isValidPassword = await bcrypt.compare(
      dto.password,
      findByEmail.password,
    );
    if (!isValidPassword) {
      throw new NotFoundException('Invalid username or password.');
    }
    const payload = {
      sub: findByEmail.id,
      email: findByEmail.email,
      role: findByEmail.role,
    };
    const {password, age, role, ...user} = findByEmail;
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }

  async getProfile(id) {
    const userProfile = await this.usersRepository.find({
      where: {
        id,
      },
    });
    const { password, ...profile } = userProfile[0];
    return profile;
  }
}
