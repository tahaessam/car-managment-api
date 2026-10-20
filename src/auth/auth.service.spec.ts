import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UsersService } from '../users/users.service.js';
import { User } from '../users/schemas/user.schema.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    usersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: getModelToken(User.name), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registers a new user without returning the password', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    const hashedPassword = await bcrypt.hash('123456', 10);
    usersService.create.mockResolvedValue({
      toObject: () => ({
        _id: 'user-123',
        email: 'user@example.com',
        username: 'taha',
        password: hashedPassword,
      }),
    });

    const result = await service.register({
      email: 'user@example.com',
      password: '123456',
      username: 'taha',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(usersService.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        _id: 'user-123',
        email: 'user@example.com',
        username: 'taha',
      }),
    );
    expect(result).not.toHaveProperty('password');
  });

  it('logs a user in and returns an access token', async () => {
    const hashedPassword = await bcrypt.hash('123456', 10);
    usersService.findByEmail.mockResolvedValue({
      _id: 'user-123',
      email: 'user@example.com',
      password: hashedPassword,
    });
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login({
      email: 'user@example.com',
      password: '123456',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'user@example.com',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('returns the authenticated profile without the password field', async () => {
    usersService.findById.mockResolvedValue({
      toObject: () => ({
        _id: 'user-123',
        email: 'user@example.com',
        username: 'taha',
        password: 'hashed-password',
      }),
    });

    const result = await service.getProfile('user-123');

    expect(usersService.findById).toHaveBeenCalledWith('user-123');
    expect(result).toEqual(
      expect.objectContaining({
        _id: 'user-123',
        email: 'user@example.com',
        username: 'taha',
      }),
    );
    expect(result).not.toHaveProperty('password');
  });
});
