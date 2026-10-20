import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Car } from '../cars/schemas/car.schema.js';
import { Maintenance } from './schemas/maintenance.schema.js';
import { MaintenanceService } from './maintenance.service.js';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let maintenanceModel: {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByIdAndUpdate: ReturnType<typeof vi.fn>;
    findByIdAndDelete: ReturnType<typeof vi.fn>;
  };
  let carModel: {
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    maintenanceModel = {
      create: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    };

    carModel = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        { provide: getModelToken(Maintenance.name), useValue: maintenanceModel },
        { provide: getModelToken(Car.name), useValue: carModel },
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

    carModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ _id: validCarId, owner: validUserId }) });
    maintenanceModel.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439013', carId: validCarId });

    const result = await service.create(validCarId, validUserId, dto);

    expect(carModel.findOne).toHaveBeenCalledWith({ _id: validCarId, owner: validUserId });
    expect(maintenanceModel.create).toHaveBeenCalledWith(
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
    carModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });

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
    maintenanceModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(record) });
    carModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ _id: 'car-123' }) });

    await expect(service.update('maintenance-1', 'user-1', {})).rejects.toBeInstanceOf(BadRequestException);
  });
});
