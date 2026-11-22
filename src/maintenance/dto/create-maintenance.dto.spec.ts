import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateMaintenanceDto } from './create-maintenance.dto.js';

describe('CreateMaintenanceDto', () => {
  const validPayload = {
    type: ' Oil Change ',
    description: ' Changed engine oil ',
    date: '2025-01-15',
    odometer: 45000,
  };

  it('trims text fields before validation', async () => {
    const dto = plainToInstance(CreateMaintenanceDto, validPayload);

    expect(dto.type).toBe('Oil Change');
    expect(dto.description).toBe('Changed engine oil');
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each(['type', 'description'] as const)(
    'rejects whitespace-only %s values',
    async (field) => {
      const dto = plainToInstance(CreateMaintenanceDto, {
        ...validPayload,
        [field]: '   ',
      });

      const errors = await validate(dto);
      expect(errors.some((error) => error.property === field)).toBe(true);
    },
  );
});
