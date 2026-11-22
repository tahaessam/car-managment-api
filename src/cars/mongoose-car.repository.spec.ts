import { describe, expect, it, vi } from 'vitest';

import { MongooseCarRepository } from './mongoose-car.repository.js';

describe('MongooseCarRepository', () => {
  it('treats regex metacharacters in brand filters as literal characters', async () => {
    const exec = vi.fn().mockResolvedValue([]);
    const find = vi.fn().mockReturnValue({ exec });
    const repository = new MongooseCarRepository({ find } as never);

    await repository.findAllOwned('507f1f77bcf86cd799439011', 'Toyota+');

    const filter = find.mock.calls[0][0];
    expect(filter.brand.$regex).toBeInstanceOf(RegExp);
    expect(filter.brand.$regex.source).toBe('^Toyota\\+$');
    expect(filter.brand.$regex.test('Toyota+')).toBe(true);
    expect(filter.brand.$regex.test('Toyota')).toBe(false);
  });
});