import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarRepository } from '../cars/car.repository.js';
import { MaintenanceRepository } from './maintenance.repository.js';
import { MaintenanceService } from './maintenance.service.js';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let maintenanceRepository: {
    create: ReturnType<typeof vi.fn>;
    findAllForCar: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let carRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    maintenanceRepository = {
      create: vi.fn(),
      findAllForCar: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    carRepository = {
      findOwnedById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        { provide: MaintenanceRepository, useValue: maintenanceRepository },
        { provide: CarRepository, useValue: carRepository },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a maintenance record only for a car owned by the current user', async () => {
    const validCarId = '507f1f77bcf86cd799439012';
    const validUserId = '507f1f77bcf86cd799439011';
    const dto = {
      type: 'Oil Change',
      description: 'Changed engine oil',
      date: '2025-01-15',
      odometer: 45000,
      laborCost: 50,
      partsCost: 30,
      notes: 'Synthetic blend',
    };

    carRepository.findOwnedById.mockResolvedValue({
      _id: validCarId,
      owner: validUserId,
    });
    maintenanceRepository.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439013',
      carId: validCarId,
    });

    const result = await service.create(validCarId, validUserId, dto);

    expect(carRepository.findOwnedById).toHaveBeenCalledWith(
      validCarId,
      validUserId,
    );
    expect(maintenanceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Oil Change',
        carId: expect.anything(),
        laborCost: 50,
        partsCost: 30,
      }),
    );
    expect(result).toEqual({ _id: '507f1f77bcf86cd799439013', carId: validCarId });
  });

  it('throws when the car does not belong to the user', async () => {
    const validCarId = '507f1f77bcf86cd799439012';
    const validUserId = '507f1f77bcf86cd799439011';
    carRepository.findOwnedById.mockResolvedValue(null);

    await expect(
      service.create(validCarId, validUserId, {
        type: 'Oil Change',
        description: 'Changed engine oil',
        date: '2025-01-15',
        odometer: 45000,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects an empty maintenance update body', async () => {
    const record = {
      _id: 'maintenance-1',
      carId: 'car-123',
    };
    maintenanceRepository.findById.mockResolvedValue(record);
    carRepository.findOwnedById.mockResolvedValue({ _id: 'car-123' });

    await expect(service.update('maintenance-1', 'user-1', {})).rejects.toBeInstanceOf(BadRequestException);
  });
});
