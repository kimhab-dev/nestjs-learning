import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorator/current-user.decorator';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { TwoFactorService } from 'src/two-factor/two-factor.service';
import { User } from 'src/users/entities/user.entity';
import { VerifyTwoFactorDto } from 'src/two-factor/dto/verify-two-factor.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly towFactorService: TwoFactorService,
  ) {}
  @Public() // make route to can public access
  @Post('register')
  @SuccessMessage(
    'Registration successful. Please check your email to verify your account.',
  )
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Public() // make route to can public access
  @SuccessMessage('Login Successfully.')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JWTAuthGuard)
  @SuccessMessage('Get profile successfully.')
  getProfile(@CurrentUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.getProfile(user.userId);
  }

  // ----------> Google OAuth2.0
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/require-await
  async googleCallback(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }

  // ----------> Google Authenticator
  @Post('2fa/setup')
  setup(@CurrentUser() user: any) {
    return this.towFactorService.generateSetup(user.userId);
  }

  @Public()
  @Post('2fa/verify')
  @SuccessMessage('Login successfully.')
  verifySetup(@Body() dto: VerifyTwoFactorDto) {
    console.log(dto);
    return this.authService.verifyLogin2fa(dto);
  }

  @Public()
  @SuccessMessage('Send request forget password successfully.')
  @Post('forgot-password-request')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @SuccessMessage('Forget password successfully.')
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(200)
  @SuccessMessage('Email verified successfully.')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('resend-verification-email')
  @HttpCode(200)
  @SuccessMessage('Verification email sent successfully.')
  resendVerificationEmail(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
