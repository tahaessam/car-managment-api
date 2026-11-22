import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { CreateCarDto } from './dto/car.create.dto.js';
import { UpdateCarDto } from './dto/car.update.dto.js';
import { CarRepository } from './car.repository.js';

@Injectable()
export class CarsService {
  constructor(private readonly carRepository: CarRepository) {}

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid car ID');
    }
  }

  async findAll(userId: string, brand?: string) {
    return this.carRepository.findAllOwned(userId, brand);
  }

  async create(userId: string, createCarDto: CreateCarDto) {
    return this.carRepository.createOwned(userId, createCarDto);
  }

  async findOne(id: string, userId: string) {
    this.validateObjectId(id);

    const car = await this.carRepository.findOwnedById(id, userId);

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async update(
    id: string,
    userId: string,
    updateCarDto: UpdateCarDto,
  ) {
    this.validateObjectId(id);

    if (!updateCarDto || Object.keys(updateCarDto).length === 0) {
      throw new BadRequestException(
        'At least one car field must be provided',
      );
    }

    const updatedCar = await this.carRepository.updateOwned(
      id,
      userId,
      updateCarDto,
    );

    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return updatedCar;
  }

  async remove(id: string, userId: string) {
    this.validateObjectId(id);

    const car = await this.carRepository.deleteOwned(id, userId);

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }
}