import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    getProfile: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
      getProfile: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registers a new user and returns a wrapped response', async () => {
    authService.register.mockResolvedValue({
      _id: 'user-123',
      email: 'user@example.com',
      username: 'taha',
    });

    const result = await controller.register({
      email: 'user@example.com',
      password: '123456',
      username: 'taha',
    });

    expect(authService.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: '123456',
      username: 'taha',
    });
    expect(result).toEqual(
      expect.objectContaining({
        message: 'تم تسجيل المستخدم بنجاح',
        success: true,
      }),
    );
    expect(result.data).toEqual(
      expect.objectContaining({
        _id: 'user-123',
        email: 'user@example.com',
      }),
    );
  });

  it('logs in a user and returns an access token response', async () => {
    authService.login.mockResolvedValue({ access_token: 'jwt-token' });

    const result = await controller.login({
      email: 'user@example.com',
      password: '123456',
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: '123456',
    });
    expect(result).toEqual({
      message: 'تم تسجيل الدخول بنجاح',
      success: true,
      data: { access_token: 'jwt-token' },
    });
  });

  it('returns the authenticated user profile', async () => {
    authService.getProfile.mockResolvedValue({
      _id: 'user-123',
      email: 'user@example.com',
      username: 'taha',
    });

    const req = { user: { userId: 'user-123', email: 'user@example.com' } };
    const result = await controller.getProfile(req);

    expect(authService.getProfile).toHaveBeenCalledWith('user-123');
    expect(result).toEqual(
      expect.objectContaining({
        message: 'تم جلب بيانات المستخدم بنجاح',
        success: true,
      }),
    );
    expect(result.data).toEqual(
      expect.objectContaining({
        _id: 'user-123',
        email: 'user@example.com',
      }),
    );
  });
});
