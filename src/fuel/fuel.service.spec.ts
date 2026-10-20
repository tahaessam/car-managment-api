import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarRepository } from '../cars/car.repository.js';
import { FuelRepository } from './fuel.repository.js';
import { FuelService } from './fuel.service.js';

describe('FuelService', () => {
  let service: FuelService;
  let fuelRepository: {
    create: ReturnType<typeof vi.fn>;
    findAllForCar: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let carRepository: {
    findOwnedById: ReturnType<typeof vi.fn>;
  };

  const userId = '507f1f77bcf86cd799439011';
  const carId = '507f1f77bcf86cd799439012';
  const fuelId = '507f1f77bcf86cd799439013';

  beforeEach(async () => {
    fuelRepository = {
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
        FuelService,
        { provide: FuelRepository, useValue: fuelRepository },
        { provide: CarRepository, useValue: carRepository },
      ],
    }).compile();

    service = module.get<FuelService>(FuelService);
  });

  it('creates a fuel log linked to a car owned by the authenticated user', async () => {
    const dto = {
      isFullTank: true,
      fuelAmount: 40,
      totalCost: 60,
      fuelPriceAmount: 1.5,
      odometerReading: 45000,
    };
    carRepository.findOwnedById.mockResolvedValue({ _id: carId, owner: userId });
    fuelRepository.create.mockResolvedValue({ _id: fuelId, carId });

    await service.create(carId, userId, dto);

    expect(carRepository.findOwnedById).toHaveBeenCalledWith(carId, userId);
    expect(fuelRepository.create).toHaveBeenCalledWith({
      ...dto,
      carId: new Types.ObjectId(carId),
    });
  });

  it('does not create a fuel log for a car not owned by the user', async () => {
    carRepository.findOwnedById.mockResolvedValue(null);

    await expect(
      service.create(carId, userId, {
        isFullTank: true,
        fuelAmount: 40,
        totalCost: 60,
        fuelPriceAmount: 1.5,
        odometerReading: 45000,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(fuelRepository.create).not.toHaveBeenCalled();
  });

  it('lists only fuel logs for an owned car', async () => {
    const expected = [{ _id: fuelId, carId }];
    carRepository.findOwnedById.mockResolvedValue({ _id: carId, owner: userId });
    fuelRepository.findAllForCar.mockResolvedValue(expected);

    await expect(service.findAll(carId, userId)).resolves.toBe(expected);
    expect(fuelRepository.findAllForCar).toHaveBeenCalledWith(carId);
  });

  it('gets a fuel log only when its car belongs to the user', async () => {
    const record = { _id: fuelId, carId: new Types.ObjectId(carId) };
    fuelRepository.findById.mockResolvedValue(record);
    carRepository.findOwnedById.mockResolvedValue({ _id: carId, owner: userId });

    await expect(service.findOne(fuelId, userId)).resolves.toBe(record);
    expect(carRepository.findOwnedById).toHaveBeenCalledWith(carId, userId);
  });

  it('rejects a fuel log that belongs to another user', async () => {
    fuelRepository.findById.mockResolvedValue({
      _id: fuelId,
      carId: new Types.ObjectId(carId),
    });
    carRepository.findOwnedById.mockResolvedValue(null);

    await expect(service.findOne(fuelId, userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a fuel log after verifying ownership', async () => {
    const record = { _id: fuelId, carId: new Types.ObjectId(carId) };
    fuelRepository.findById.mockResolvedValue(record);
    carRepository.findOwnedById.mockResolvedValue({ _id: carId, owner: userId });
    fuelRepository.update.mockResolvedValue({ ...record, totalCost: 70 });

    await expect(
      service.update(fuelId, userId, { totalCost: 70 }),
    ).resolves.toEqual({ ...record, totalCost: 70 });
    expect(fuelRepository.update).toHaveBeenCalledWith(fuelId, {
      totalCost: 70,
    });
  });

  it('deletes a fuel log after verifying ownership', async () => {
    const record = { _id: fuelId, carId: new Types.ObjectId(carId) };
    fuelRepository.findById.mockResolvedValue(record);
    carRepository.findOwnedById.mockResolvedValue({ _id: carId, owner: userId });
    fuelRepository.delete.mockResolvedValue(record);

    await expect(service.remove(fuelId, userId)).resolves.toBe(record);
    expect(fuelRepository.delete).toHaveBeenCalledWith(fuelId);
  });

  it('rejects invalid IDs and empty update bodies', async () => {
    await expect(service.findOne('bad-id', userId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.update(fuelId, userId, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
