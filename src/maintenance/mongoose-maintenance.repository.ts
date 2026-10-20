import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Maintenance,
  MaintenanceDocument,
} from './schemas/maintenance.schema.js';
import { MaintenanceRepository } from './maintenance.repository.js';

@Injectable()
export class MongooseMaintenanceRepository implements MaintenanceRepository {
  constructor(
    @InjectModel(Maintenance.name)
    private readonly maintenanceModel: Model<Maintenance>,
  ) {}

  create(data: Partial<Maintenance>): Promise<MaintenanceDocument> {
    return this.maintenanceModel.create(data);
  }

  findAllForCar(carId: string): Promise<MaintenanceDocument[]> {
    return this.maintenanceModel.find({ carId }).sort({ date: -1 }).exec();
  }

  findById(id: string): Promise<MaintenanceDocument | null> {
    return this.maintenanceModel.findById(id).exec();
  }

  update(
    id: string,
    data: Partial<Maintenance>,
  ): Promise<MaintenanceDocument | null> {
    return this.maintenanceModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  delete(id: string): Promise<MaintenanceDocument | null> {
    return this.maintenanceModel.findByIdAndDelete(id).exec();
  }
}
