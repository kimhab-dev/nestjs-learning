import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async generateSetup(userId: number) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const secret = generateSecret();

    const uri = generateURI({
      issuer: 'MyNestApp',
      label: user.email,
      secret,
    });

    const qrCode = await QRCode.toDataURL(uri);
    user.twoFactorPendingSecret = secret;

    await this.userRepo.save(user);
    return {
      secret,
      qrCode,
    };
  }
  async verifySetup(userId: number, code: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.twoFactorPendingSecret) {
      throw new BadRequestException(
        'Two-factor authentication setup has not started.',
      );
    }

    const result = await verify({
      secret: user.twoFactorPendingSecret,
      token: code,
    });

    if (!result.valid) {
      throw new BadRequestException('Invalid authenticator code.');
    }

    user.twoFactorSecret = user.twoFactorPendingSecret;
    user.twoFactorPendingSecret = null;
    user.twoFactorEnabled = true;

    await this.userRepo.save(user);

    return {
      message: 'Two-factor authentication enabled successfully.',
    };
  }
}
