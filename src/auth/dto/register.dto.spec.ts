import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { RegisterDto } from './register.dto.js';

describe('RegisterDto', () => {
  it('trims email and username before validation', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: ' driver@example.com ',
      password: 'password123',
      username: ' driver ',
    });

    expect(dto.email).toBe('driver@example.com');
    expect(dto.username).toBe('driver');
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a whitespace-only username', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'driver@example.com',
      password: 'password123',
      username: '   ',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'username')).toBe(true);
  });
});
