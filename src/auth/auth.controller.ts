import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @SuccessMessage('Register successfully.')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @SuccessMessage('Login Successfully.')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
