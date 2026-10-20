import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { Maintenance } from './schemas/maintenance.schema.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto.js';
import { MaintenanceRepository } from './maintenance.repository.js';
import { CarRepository } from '../cars/car.repository.js';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly carRepository: CarRepository,
  ) {}

  private validateObjectId(id: string, fieldName: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
  }

  private async ensureCarOwnership(carId: string, userId: string) {
    this.validateObjectId(carId, 'car ID');

    const car = await this.carRepository.findOwnedById(carId, userId);

    if (!car) {
      throw new NotFoundException(
        `Car with ID ${carId} not found`,
      );
    }

    return car;
  }

  async create(
    carId: string,
    userId: string,
    createMaintenanceDto: CreateMaintenanceDto,
  ) {
    await this.ensureCarOwnership(carId, userId);

    return this.maintenanceRepository.create({
      ...createMaintenanceDto,
      carId: new Types.ObjectId(carId),
      laborCost: createMaintenanceDto.laborCost ?? 0,
      partsCost: createMaintenanceDto.partsCost ?? 0,
      date: new Date(createMaintenanceDto.date),
    });
  }

  async findAll(carId: string, userId: string) {
    await this.ensureCarOwnership(carId, userId);

    return this.maintenanceRepository.findAllForCar(carId);
  }

  async findOne(id: string, userId: string) {
    this.validateObjectId(id, 'maintenance ID');

    const record = await this.maintenanceRepository.findById(id);

    if (!record) {
      throw new NotFoundException(
        `Maintenance record with ID ${id} not found`,
      );
    }

    await this.ensureCarOwnership(
      record.carId.toString(),
      userId,
    );

    return record;
  }

  async update(
    id: string,
    userId: string,
    updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    this.validateObjectId(id, 'maintenance ID');

    if (
      !updateMaintenanceDto ||
      Object.keys(updateMaintenanceDto).length === 0
    ) {
      throw new BadRequestException(
        'At least one maintenance field must be provided',
      );
    }

    await this.findOne(id, userId);

    const { date, ...fields } = updateMaintenanceDto;
    const updatedData: Partial<Maintenance> = { ...fields };
    if (date !== undefined) {
      updatedData.date = new Date(date);
    }

    const updatedRecord = await this.maintenanceRepository.update(
      id,
      updatedData,
    );

    if (!updatedRecord) {
      throw new NotFoundException(
        `Maintenance record with ID ${id} not found`,
      );
    }

    return updatedRecord;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const deleted = await this.maintenanceRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(
        `Maintenance record with ID ${id} not found`,
      );
    }
    return deleted;
  }
}