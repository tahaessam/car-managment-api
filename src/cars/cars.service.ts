import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Car } from './schemas/car.schema.js';
import { CreateCarDto } from './dto/car.create.dto.js';
import { UpdateCarDto } from './dto/car.update.dto.js';

@Injectable()
export class CarsService {
  constructor(
    @InjectModel(Car.name)
    private readonly carModel: Model<Car>,
  ) {}

  async findAll(userId: string, brand?: string) {
    if (brand) {
      return this.carModel
        .find({
          owner: userId,
          brand: { $regex: `^${brand}$`, $options: 'i' },
        })
        .exec();
    }

    return this.carModel.find({ owner: userId }).exec();
  }

  async create(userId: string, createCarDto: CreateCarDto) {
    return this.carModel.create({
      ...createCarDto,
      owner: new Types.ObjectId(userId),
    });
  }

  async findOne(id: string, userId: string) {
    const car = await this.carModel
      .findOne({ _id: id, owner: userId })
      .exec();

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
    if (!updateCarDto || Object.keys(updateCarDto).length === 0) {
      throw new BadRequestException(
        'At least one car field must be provided',
      );
    }

    const updatedCar = await this.carModel
      .findOneAndUpdate(
        { _id: id, owner: userId },
        { $set: updateCarDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return updatedCar;
  }

  async remove(id: string, userId: string) {
    const car = await this.carModel
      .findOneAndDelete({ _id: id, owner: userId })
      .exec();

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }
}