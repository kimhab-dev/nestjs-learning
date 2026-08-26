import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyTwoFactorDto } from 'src/two-factor/dto/verify-two-factor.dto';
import { verify } from 'otplib';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordToken } from '../reset-password-token/reset-password-token.entity';
import { EmailVerificationToken } from 'src/email-verification-token/email-verification-token.entity';
import { ChangeEmailToken } from 'src/change-email-token/change-email-token.entity';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangeEmailRequestDto } from './dto/change-email-request.dto';
import { ConfirmChangeEmailDto } from './dto/confirm-change-email.dto';
import {
  getRelativeFilePath,
  removeUploadedFile,
} from 'src/common/helpers/file-upload.helper';
import { plainToInstance } from 'class-transformer';
import { AllUsersResponseDto } from 'src/users/dto/user-response.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ResetPasswordToken)
    private readonly resetpPasswordToken: Repository<ResetPasswordToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    @InjectRepository(ChangeEmailToken)
    private readonly changeEmailTokenRepository: Repository<ChangeEmailToken>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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

  // ----------------------------------------------------------------------

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
      isVerified: false,
    });
    const saveUser = await this.usersRepository.save(user);

    // Create verification token (expires in 24 hours)
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const emailTokenRecord = this.emailVerificationTokenRepository.create({
      token: verificationToken,
      expires: verificationExpires,
      isUsed: false,
      user: saveUser,
    });
    await this.emailVerificationTokenRepository.save(emailTokenRecord);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await this.mailService.sendVerificationEmail(
      saveUser.email,
      verificationLink,
    );

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

    // Check if email is verified
    if (!findByEmail.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
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
    const { password, twoFactorPendingSecret, twoFactorSecret, ...profile } =
      userProfile[0];
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
        email,
        isVerified: true,
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
        id: payload.sub,
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

  // -----> forget password
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    const message = 'If the email exists, a reset link has been sent.';

    if (!user) {
      return {
        message,
      };
    }

    const resetToken = randomBytes(32).toString('hex');

    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    const saveUser = this.resetpPasswordToken.create({
      token: resetToken,
      expires: resetPasswordExpires,
      isUsed: false,
      user,
    });
    await this.resetpPasswordToken.save(saveUser);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendResetPasswordEmail(user.email, resetLink);

    return {
      message,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const isToken = await this.resetpPasswordToken.findOne({
      where: {
        token: dto.token,
      },
      relations: {
        user: true,
      },
    });

    if (!isToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (!isToken.expires || isToken.expires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    const user = isToken.user;
    user.password = hashedPassword;
    await this.usersRepository.save(user);
    await this.resetpPasswordToken.delete({
      user: {
        id: user.id,
      },
    });
  }

  // -----> email verification
  async verifyEmail(dto: VerifyEmailDto) {
    const emailToken = await this.emailVerificationTokenRepository.findOne({
      where: {
        token: dto.token,
      },
      relations: {
        user: true,
      },
    });

    if (!emailToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (
      emailToken.isUsed ||
      (emailToken.expires && emailToken.expires < new Date())
    ) {
      throw new BadRequestException(
        'Verification token has expired or has already been used',
      );
    }

    const user = emailToken.user;
    user.isVerified = true;
    await this.usersRepository.save(user);

    await this.emailVerificationTokenRepository.delete({
      user: {
        id: user.id,
      },
    });

    return {
      details: 'Email verified successfully. You can now login.',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    const message =
      'If the email is registered and unverified, a verification link has been sent.';

    if (!user) {
      return { message };
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    // Delete old verification tokens for this user
    await this.emailVerificationTokenRepository.delete({
      user: {
        id: user.id,
      },
    });

    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const emailTokenRecord = this.emailVerificationTokenRepository.create({
      token: verificationToken,
      expires: verificationExpires,
      isUsed: false,
      user,
    });
    await this.emailVerificationTokenRepository.save(emailTokenRecord);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    await this.mailService.sendVerificationEmail(user.email, verificationLink);
  }

  async uploadImageProfile(
    userId: number,
    file: Express.Multer.File,
  ): Promise<AllUsersResponseDto> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      removeUploadedFile(file.path);
      throw new NotFoundException('User not found.');
    }

    const oldImage = user.avatar;
    user.avatar = getRelativeFilePath(file, 'profiles');
    const saved = await this.usersRepository.save(user);
    if (oldImage && oldImage !== user.avatar) {
      removeUploadedFile(oldImage);
    }

    return plainToInstance(AllUsersResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async deleteAvatar(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.avatar) {
      if (user.avatar == 'uploads/defualt-avatar.jpg')
        throw new BadRequestException('Default avatar cannot delete.');
      const oldAvatar = user.avatar;
      removeUploadedFile(oldAvatar);
    }
    user.avatar = 'uploads/defualt-avatar.jpg';
    await this.usersRepository.save(user);
  }

  // -----> change email
  async requestChangeEmail(userId: number, dto: ChangeEmailRequestDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Cannot change email for accounts authenticated solely via external providers.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password.');
    }

    if (user.email.toLowerCase() === dto.newEmail.toLowerCase()) {
      throw new BadRequestException(
        'New email cannot be the same as your current email.',
      );
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.newEmail },
    });
    if (existingUser) {
      throw new ConflictException(
        'The email is already in use by another account.',
      );
    }

    // Clean up old change-email tokens for this user
    await this.changeEmailTokenRepository.delete({
      user: { id: user.id },
    });

    const changeToken = randomBytes(32).toString('hex');
    const changeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const changeTokenRecord = this.changeEmailTokenRepository.create({
      token: changeToken,
      newEmail: dto.newEmail,
      expires: changeExpires,
      isUsed: false,
      user,
    });
    await this.changeEmailTokenRepository.save(changeTokenRecord);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-change-email?token=${changeToken}`;

    await this.mailService.sendChangeEmailVerification(
      dto.newEmail,
      verificationLink,
    );
    await this.mailService.sendChangeEmailSecurityAlert(
      user.email,
      dto.newEmail,
    );

    return {
      message: 'Verification link sent to your new email address.',
    };
  }

  async confirmChangeEmail(dto: ConfirmChangeEmailDto) {
    const tokenRecord = await this.changeEmailTokenRepository.findOne({
      where: { token: dto.token },
      relations: { user: true },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired email change token.');
    }

    if (
      tokenRecord.isUsed ||
      (tokenRecord.expires && tokenRecord.expires < new Date())
    ) {
      throw new BadRequestException(
        'Email change token has expired or has already been used.',
      );
    }

    // Re-verify that newEmail is not taken in the interim
    const existingUser = await this.usersRepository.findOne({
      where: { email: tokenRecord.newEmail },
    });
    if (existingUser && existingUser.id !== tokenRecord.user.id) {
      throw new ConflictException(
        'The new email address is already taken by another account.',
      );
    }

    const user = tokenRecord.user;
    user.email = tokenRecord.newEmail;
    user.isVerified = true;
    await this.usersRepository.save(user);

    await this.changeEmailTokenRepository.delete({
      user: { id: user.id },
    });

    return {
      message: 'Email changed successfully.',
    };
  }
}
