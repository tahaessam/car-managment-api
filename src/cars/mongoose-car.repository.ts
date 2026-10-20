import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Car, CarDocument } from './schemas/car.schema.js';
import { CreateCarDto } from './dto/car.create.dto.js';
import { UpdateCarDto } from './dto/car.update.dto.js';
import { CarRepository } from './car.repository.js';

@Injectable()
export class MongooseCarRepository implements CarRepository {
  constructor(
    @InjectModel(Car.name)
    private readonly carModel: Model<Car>,
  ) {}

  findAllOwned(userId: string, brand?: string): Promise<CarDocument[]> {
    const filter = brand
      ? {
          owner: userId,
          brand: { $regex: `^${brand}$`, $options: 'i' },
        }
      : { owner: userId };

    return this.carModel.find(filter).exec();
  }

  createOwned(userId: string, data: CreateCarDto): Promise<CarDocument> {
    return this.carModel.create({
      ...data,
      owner: new Types.ObjectId(userId),
    });
  }

  findOwnedById(id: string, userId: string): Promise<CarDocument | null> {
    return this.carModel.findOne({ _id: id, owner: userId }).exec();
  }

  updateOwned(
    id: string,
    userId: string,
    data: UpdateCarDto,
  ): Promise<CarDocument | null> {
    return this.carModel
      .findOneAndUpdate(
        { _id: id, owner: userId },
        { $set: data },
        { new: true, runValidators: true },
      )
      .exec();
  }

  deleteOwned(id: string, userId: string): Promise<CarDocument | null> {
    return this.carModel.findOneAndDelete({ _id: id, owner: userId }).exec();
  }
}
