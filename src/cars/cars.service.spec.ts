import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Car } from './schemas/car.schema.js';
import { CarsService } from './cars.service.js';

describe('CarsService', () => {
  let service: CarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        { provide: getModelToken(Car.name), useValue: {} },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a missing update body', async () => {
    await expect(
      service.update('6acfba8df8327c5e4321d8d7', undefined as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an empty update body', async () => {
    await expect(
      service.update('6acfba8df8327c5e4321d8d7', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
