import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { User } from '../users/entities/user.entity';
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
}
