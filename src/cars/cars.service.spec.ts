import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Car } from './schemas/car.schema.js';
import { CarsService } from './cars.service.js';

describe('CarsService', () => {
  let service: CarsService;
  let carModel: {
    find: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findOneAndUpdate: ReturnType<typeof vi.fn>;
    findOneAndDelete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    carModel = {
      find: vi.fn(),
      create: vi.fn(),
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        { provide: getModelToken(Car.name), useValue: carModel },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('assigns a created car to the authenticated user', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    carModel.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439012', owner: validUserId });

    const result = await service.create(validUserId, {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      PlateNum: 'ABC-123',
    });

    expect(carModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        brand: 'Toyota',
        owner: expect.anything(),
      }),
    );
    expect(result).toEqual({ _id: '507f1f77bcf86cd799439012', owner: validUserId });
  });

  it('rejects a missing update body', async () => {
    await expect(
      service.update('6acfba8df8327c5e4321d8d7', 'user-1', undefined as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an empty update body', async () => {
    await expect(
      service.update('6acfba8df8327c5e4321d8d7', 'user-1', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
