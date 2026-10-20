import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FuelController } from './fuel.controller.js';
import { FuelService } from './fuel.service.js';

describe('FuelController', () => {
  let controller: FuelController;
  let fuelService: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    fuelService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FuelController],
      providers: [{ provide: FuelService, useValue: fuelService }],
    }).compile();

    controller = module.get<FuelController>(FuelController);
  });

  it('passes car and authenticated user IDs when creating a fuel log', () => {
    const dto = {
      isFullTank: true,
      fuelAmount: 40,
      totalCost: 60,
      fuelPriceAmount: 1.5,
      odometerReading: 45000,
    };
    const request = { user: { userId: 'user-1' } };

    controller.create('car-1', dto, request);

    expect(fuelService.create).toHaveBeenCalledWith('car-1', 'user-1', dto);
  });

  it('passes car and authenticated user IDs when listing fuel logs', () => {
    controller.findAll('car-1', { user: { userId: 'user-1' } });
    expect(fuelService.findAll).toHaveBeenCalledWith('car-1', 'user-1');
  });

  it('passes the authenticated user when reading a fuel log', () => {
    controller.findOne('fuel-1', { user: { userId: 'user-1' } });
    expect(fuelService.findOne).toHaveBeenCalledWith('fuel-1', 'user-1');
  });

  it('passes the authenticated user when updating a fuel log', () => {
    const dto = { totalCost: 70 };
    controller.update('fuel-1', dto, { user: { userId: 'user-1' } });
    expect(fuelService.update).toHaveBeenCalledWith('fuel-1', 'user-1', dto);
  });

  it('passes the authenticated user when deleting a fuel log', () => {
    controller.remove('fuel-1', { user: { userId: 'user-1' } });
    expect(fuelService.remove).toHaveBeenCalledWith('fuel-1', 'user-1');
  });
});
