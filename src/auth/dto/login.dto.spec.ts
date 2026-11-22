import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { LoginDto } from './login.dto.js';

describe('LoginDto', () => {
  it('trims the email before validation', async () => {
    const dto = plainToInstance(LoginDto, {
      email: ' driver@example.com ',
      password: 'password123',
    });

    expect(dto.email).toBe('driver@example.com');
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an empty password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'driver@example.com',
      password: '',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
