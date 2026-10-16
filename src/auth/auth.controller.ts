import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'تم تسجيل المستخدم بنجاح',
      success: true,
      data: user,
    };
  }

  // POST /auth/login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return {
      message: 'تم تسجيل الدخول بنجاح',
      success: true,
      data: tokens,
    };
  }

  // GET /auth/profile — محمي بالـ JwtAuthGuard
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { userId: string; email: string } }) {
    const profile = await this.authService.getProfile(req.user.userId);
    return {
      message: 'تم جلب بيانات المستخدم بنجاح',
      success: true,
      data: profile,
    };
  }
}
