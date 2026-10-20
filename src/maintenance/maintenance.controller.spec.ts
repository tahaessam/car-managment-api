import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MaintenanceController } from './maintenance.controller.js';
import { MaintenanceService } from './maintenance.service.js';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  let maintenanceService: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    maintenanceService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [{ provide: MaintenanceService, useValue: maintenanceService }],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates maintenance creation to the service with the car id and user id', async () => {
    const dto = {
      type: 'Oil Change',
      description: 'Changed engine oil',
      date: '2025-01-15',
      odometer: 45000,
      laborCost: 50,
      partsCost: 30,
      notes: 'Synthetic blend',
    };

    maintenanceService.create.mockResolvedValue({ _id: 'maintenance-1' });

    const result = await controller.create('car-123', dto, { user: { userId: 'user-1' } });

    expect(maintenanceService.create).toHaveBeenCalledWith('car-123', 'user-1', dto);
    expect(result).toEqual({ _id: 'maintenance-1' });
  });
});
