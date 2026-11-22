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

  it.each(['', '   '])('rejects blank car text fields (%j)', async (blank) => {
    const dto = plainToInstance(CreateCarDto, {
      brand: blank,
      model: 'Corolla',
      year: 2024,
      PlateNum: 'ABC-123',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'brand')).toBe(true);
  });

  it('rejects car text fields that exceed the documented limits', async () => {
    const dto = plainToInstance(CreateCarDto, {
      brand: 'B'.repeat(101),
      model: 'Corolla',
      year: 2024,
      PlateNum: 'ABC-123',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'brand')).toBe(true);
  });
});
