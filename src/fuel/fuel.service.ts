import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { CarRepository } from '../cars/car.repository.js';
import { CreateFuelDto } from './dto/create-fuel.dto.js';
import { UpdateFuelDto } from './dto/update-fuel.dto.js';
import { FuelRepository } from './fuel.repository.js';

@Injectable()
export class FuelService {
  constructor(
    private readonly fuelRepository: FuelRepository,
    private readonly carRepository: CarRepository,
  ) {}

  private validateObjectId(id: string, fieldName: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
  }

  private async ensureCarOwnership(carId: string, userId: string): Promise<void> {
    this.validateObjectId(carId, 'car ID');

    const car = await this.carRepository.findOwnedById(carId, userId);
    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }
  }

  async create(carId: string, userId: string, createFuelDto: CreateFuelDto) {
    await this.ensureCarOwnership(carId, userId);

    return this.fuelRepository.create({
      ...createFuelDto,
      carId: new Types.ObjectId(carId),
    });
  }

  async findAll(carId: string, userId: string) {
    await this.ensureCarOwnership(carId, userId);
    return this.fuelRepository.findAllForCar(carId);
  }

  async findOne(id: string, userId: string) {
    this.validateObjectId(id, 'fuel log ID');

    const fuel = await this.fuelRepository.findById(id);
    if (!fuel) {
      throw new NotFoundException(`Fuel log with ID ${id} not found`);
    }

    await this.ensureCarOwnership(fuel.carId.toString(), userId);
    return fuel;
  }

  async update(id: string, userId: string, updateFuelDto: UpdateFuelDto) {
    this.validateObjectId(id, 'fuel log ID');
    if (!updateFuelDto || Object.keys(updateFuelDto).length === 0) {
      throw new BadRequestException('At least one fuel field must be provided');
    }

    await this.findOne(id, userId);
    const updatedFuel = await this.fuelRepository.update(id, updateFuelDto);
    if (!updatedFuel) {
      throw new NotFoundException(`Fuel log with ID ${id} not found`);
    }

    return updatedFuel;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const deletedFuel = await this.fuelRepository.delete(id);
    if (!deletedFuel) {
      throw new NotFoundException(`Fuel log with ID ${id} not found`);
    }

    return deletedFuel;
  }
}
