import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './user-register.dto';
import { UserLoginDto } from './user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: UserRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: UserLoginDto) {
    return this.authService.login(dto);
  }
}
