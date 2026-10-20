import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarRepository } from './car.repository.js';
import { CarsService } from './cars.service.js';

describe('CarsService', () => {
  let service: CarsService;
  let carRepository: {
    findAllOwned: ReturnType<typeof vi.fn>;
    createOwned: ReturnType<typeof vi.fn>;
    findOwnedById: ReturnType<typeof vi.fn>;
    updateOwned: ReturnType<typeof vi.fn>;
    deleteOwned: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    carRepository = {
      findAllOwned: vi.fn(),
      createOwned: vi.fn(),
      findOwnedById: vi.fn(),
      updateOwned: vi.fn(),
      deleteOwned: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        { provide: CarRepository, useValue: carRepository },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('assigns a created car to the authenticated user', async () => {
    const validUserId = '507f1f77bcf86cd799439011';
    carRepository.createOwned.mockResolvedValue({
      _id: '507f1f77bcf86cd799439012',
      owner: validUserId,
    });

    const result = await service.create(validUserId, {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      PlateNum: 'ABC-123',
    });

    expect(carRepository.createOwned).toHaveBeenCalledWith(validUserId, {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      PlateNum: 'ABC-123',
    });
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
