import { MaintenanceDocument } from './schemas/maintenance.schema.js';
import { Maintenance } from './schemas/maintenance.schema.js';

export abstract class MaintenanceRepository {
  abstract create(data: Partial<Maintenance>): Promise<MaintenanceDocument>;
  abstract findAllForCar(carId: string): Promise<MaintenanceDocument[]>;
  abstract findById(id: string): Promise<MaintenanceDocument | null>;
  abstract update(
    id: string,
    data: Partial<Maintenance>,
  ): Promise<MaintenanceDocument | null>;
  abstract delete(id: string): Promise<MaintenanceDocument | null>;
}
