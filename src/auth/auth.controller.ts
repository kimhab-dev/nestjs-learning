import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly towFactorService: TwoFactorService
  ) {}
  @Public() // make route to can public access
  @Post('register')
  @SuccessMessage('Register successfully.')
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

  @Post('2fa/verify-setup')
  verifySetup(@CurrentUser() user: any, @Body() dto: VerifyTwoFactorDto) {
    return this.towFactorService.verifySetup(user.userId, dto.code);
  }
}
