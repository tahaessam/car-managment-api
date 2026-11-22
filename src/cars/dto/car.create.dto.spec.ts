import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateCarDto } from './car.create.dto.js';

describe('CreateCarDto', () => {
  it('trims car text fields before validation', async () => {
    const dto = plainToInstance(CreateCarDto, {
      brand: ' Toyota ',
      model: ' Corolla ',
      year: 2024,
      PlateNum: ' ABC-123 ',
    });

    expect(dto.brand).toBe('Toyota');
    expect(dto.model).toBe('Corolla');
    expect(dto.PlateNum).toBe('ABC-123');
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each(['brand', 'model', 'PlateNum'] as const)(
    'rejects blank %s values',
    async (field) => {
      const dto = plainToInstance(CreateCarDto, {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2024,
        PlateNum: 'ABC-123',
        [field]: '   ',
      });

      const errors = await validate(dto);
      expect(errors.some((error) => error.property === field)).toBe(true);
    },
  );
});