import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Fuel, FuelDocument } from './schemas/fuel.schema.js';
import { FuelRepository } from './fuel.repository.js';

@Injectable()
export class MongooseFuelRepository implements FuelRepository {
  constructor(
    @InjectModel(Fuel.name)
    private readonly fuelModel: Model<Fuel>,
  ) {}

  create(data: Partial<Fuel>): Promise<FuelDocument> {
    return this.fuelModel.create(data);
  }

  findAllForCar(carId: string): Promise<FuelDocument[]> {
    return this.fuelModel.find({ carId }).sort({ createdAt: -1 }).exec();
  }

  findById(id: string): Promise<FuelDocument | null> {
    return this.fuelModel.findById(id).exec();
  }

  update(id: string, data: Partial<Fuel>): Promise<FuelDocument | null> {
    return this.fuelModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  delete(id: string): Promise<FuelDocument | null> {
    return this.fuelModel.findByIdAndDelete(id).exec();
  }
}
