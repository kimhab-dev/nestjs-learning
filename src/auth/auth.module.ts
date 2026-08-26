import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { TwoFactorModule } from 'src/two-factor/two-factor.module';
import { ResetPasswordToken } from '../reset-password-token/reset-password-token.entity';
import { EmailVerificationToken } from 'src/email-verification-token/email-verification-token.entity';
import { ChangeEmailToken } from 'src/change-email-token/change-email-token.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    PassportModule,
    TwoFactorModule,
    ConfigModule,
    MailModule,
    TypeOrmModule.forFeature([
      User,
      ResetPasswordToken,
      EmailVerificationToken,
      ChangeEmailToken,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
