import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Car } from './schemas/car.schema.js';
import { CreateCarDto } from './dto/car.create.dto.js';
import { UpdateCarDto } from './dto/car.update.dto.js';
@Injectable()
export class CarsService {
  constructor(
    @InjectModel(Car.name)
    private readonly carModel: Model<Car>,
  ) {}

  async findAll(brand?: string) {
    const filter = brand
      ? { brand: { $regex: `^${brand}$`, $options: 'i' } }
      : {};

    return this.carModel.find(filter).exec();
  }
  async create(createCarDto: CreateCarDto) {
    return this.carModel.create(createCarDto);
  }
  async findOne(id: string) {
    const car = await this.carModel.findById(id).exec();

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }
  async update(id: string, updateCarDto: UpdateCarDto) {
    if (!updateCarDto || Object.keys(updateCarDto).length === 0) {
      throw new BadRequestException('At least one car field must be provided');
    }

    const updatedCar = await this.carModel
      .findByIdAndUpdate(id, updateCarDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return updatedCar;
  }
  //delete a car by its ID
  async remove(id: string) {
    const car = await this.carModel.findByIdAndDelete(id).exec();

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }
}
