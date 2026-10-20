import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Maintenance } from './schemas/maintenance.schema.js';
import { Car } from '../cars/schemas/car.schema.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto.js';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name)
    private readonly maintenanceModel: Model<Maintenance>,

    @InjectModel(Car.name)
    private readonly carModel: Model<Car>,
  ) {}

  private validateObjectId(id: string, fieldName: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
  }

  private async ensureCarOwnership(carId: string, userId: string) {
    this.validateObjectId(carId, 'car ID');

    const car = await this.carModel
      .findOne({ _id: carId, owner: userId })
      .exec();

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

    return this.maintenanceModel.create({
      ...createMaintenanceDto,
      carId: new Types.ObjectId(carId),
      laborCost: createMaintenanceDto.laborCost ?? 0,
      partsCost: createMaintenanceDto.partsCost ?? 0,
      date: new Date(createMaintenanceDto.date),
    });
  }

  async findAll(carId: string, userId: string) {
    await this.ensureCarOwnership(carId, userId);

    return this.maintenanceModel
      .find({ carId })
      .sort({ date: -1 })
      .exec();
  }

  async findOne(id: string, userId: string) {
    this.validateObjectId(id, 'maintenance ID');

    const record = await this.maintenanceModel
      .findById(id)
      .exec();

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

    const record = await this.findOne(id, userId);

    const updatedData = {
      ...updateMaintenanceDto,
    };

    if (updatedData.date !== undefined) {
      updatedData.date = new Date(updatedData.date) as any;
    }

    const updatedRecord = await this.maintenanceModel
      .findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedRecord) {
      throw new NotFoundException(
        `Maintenance record with ID ${id} not found`,
      );
    }

    return updatedRecord;
  }

  async remove(id: string, userId: string) {
    const record = await this.findOne(id, userId);

    await this.maintenanceModel.findByIdAndDelete(id).exec();

    return record;
  }
}