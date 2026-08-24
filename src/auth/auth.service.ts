import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyTwoFactorDto } from 'src/two-factor/dto/verify-two-factor.dto';
import { verify } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async generateJwt(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    return this.jwtService.sign(payload);
  }

  private generateTwoFactorToken(user: User) {
    return this.jwtService.sign(
      {
        sub: user.id,
        type: '2fa_pending',
      },
      {
        expiresIn: '5m',
      },
    );
  }

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, age, role, ...result } = saveUser;
    return result;
  }

  async login(dto: LoginDto) {
    const [findByEmail] = await this.usersRepository.findBy({
      email: dto.email,
    });
    if (!findByEmail || !findByEmail.password) {
      throw new NotFoundException('Invalid username or password.');
    }
    const isValidPassword = await bcrypt.compare(
      dto.password,
      findByEmail.password,
    );
    if (!isValidPassword) {
      throw new NotFoundException('Invalid username or password.');
    }

    // Check 2FA
    if (findByEmail.twoFactorEnabled) {
      const tempToken = this.generateTwoFactorToken(findByEmail);

      return {
        requiresTwoFactor: true,
        tempToken,
      };
    }
    const token = await this.generateJwt(findByEmail);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, age, role, ...user } = findByEmail;

    return {
      user,
      token,
    };
  }

  async getProfile(id) {
    const userProfile = await this.usersRepository.find({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, twoFactorPendingSecret, twoFactorSecret, ...profile } = userProfile[0];
    return profile;
  }

  async validateGoogleUser(profile: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new Error('Google account does not have an email');
    }

    let user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      user = this.usersRepository.create({
        name: profile.displayName,
        email
      });

      user = await this.usersRepository.save(user);
    }
    // Check 2FA
    if (user.twoFactorEnabled) {
      const tempToken = this.generateTwoFactorToken(user);

      return {
        requiresTwoFactor: true,
        tempToken,
      };
    }
    const token = await this.generateJwt(user);

    const { password, age, role, ...result } = user;

    return {
      result,
      token,
    };
  }

  async verifyLogin2fa(dto: VerifyTwoFactorDto) {
    let payload: any;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload = this.jwtService.verify(dto.tempToken);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired two-factor token.');
    }

    if (payload.type !== '2fa_pending') {
      throw new UnauthorizedException('Invalid @FA token');
    }

    const user = await this.usersRepository.findOne({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: payload.sub
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException(
        'Two-factor authentication is not enabled.',
      );
    }
    const isValid = await verify({
      secret: user.twoFactorSecret,
      token: dto.code,
    });
    if (!isValid.valid) {
      throw new UnauthorizedException('Invalid authenticator code.');
    }
    const token = await this.generateJwt(user);
    const { password, age, role, ...result } = user;

    return {
      result,
      token,
    };
  }
}
