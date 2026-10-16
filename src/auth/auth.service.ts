import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  //! Register Flow
  async register(registerDto: RegisterDto) {
    // التحقق إذا المستخدم موجود مسبقاً
    const existingUser = await this.usersService.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مسجّل مسبقاً');
    }

    // تشفير كلمة السر باستخدام bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      saltRounds,
    );

    // إنشاء المستخدم بكلمة سر مشفرة
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      username: registerDto.username,
    });

    // إرجاع بيانات المستخدم بدون كلمة السر
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
  }

  //! Login Flow
  async login(loginDto: LoginDto) {
    // البحث عن المستخدم بالبريد الإلكتروني
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // مقارنة كلمة السر
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    // إصدار Access Token
    const payload = { sub: user._id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { access_token: accessToken };
  }

  //! Get Profile
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
  }
}
