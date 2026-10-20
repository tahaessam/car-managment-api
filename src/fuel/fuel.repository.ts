import { FuelDocument } from './schemas/fuel.schema.js';
import { Fuel } from './schemas/fuel.schema.js';

export abstract class FuelRepository {
  abstract create(data: Partial<Fuel>): Promise<FuelDocument>;
  abstract findAllForCar(carId: string): Promise<FuelDocument[]>;
  abstract findById(id: string): Promise<FuelDocument | null>;
  abstract update(
    id: string,
    data: Partial<Fuel>,
  ): Promise<FuelDocument | null>;
  abstract delete(id: string): Promise<FuelDocument | null>;
}
