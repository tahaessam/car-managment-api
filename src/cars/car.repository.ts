import { CarDocument } from './schemas/car.schema.js';
import { CreateCarDto } from './dto/car.create.dto.js';
import { UpdateCarDto } from './dto/car.update.dto.js';

export abstract class CarRepository {
  abstract findAllOwned(userId: string, brand?: string): Promise<CarDocument[]>;
  abstract createOwned(userId: string, data: CreateCarDto): Promise<CarDocument>;
  abstract findOwnedById(id: string, userId: string): Promise<CarDocument | null>;
  abstract updateOwned(
    id: string,
    userId: string,
    data: UpdateCarDto,
  ): Promise<CarDocument | null>;
  abstract deleteOwned(id: string, userId: string): Promise<CarDocument | null>;
}
