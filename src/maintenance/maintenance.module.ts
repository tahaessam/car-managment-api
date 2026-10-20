import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MaintenanceService } from './maintenance.service.js';
import { MaintenanceController } from './maintenance.controller.js';
import { MaintenanceRepository } from './maintenance.repository.js';
import { MongooseMaintenanceRepository } from './mongoose-maintenance.repository.js';

import {
  Maintenance,
  MaintenanceSchema,
} from './schemas/maintenance.schema.js';

import { CarsModule } from '../cars/cars.module.js';

@Module({
  imports: [
    CarsModule,
    MongooseModule.forFeature([
      { name: Maintenance.name, schema: MaintenanceSchema },
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [
    MaintenanceService,
    MongooseMaintenanceRepository,
    { provide: MaintenanceRepository, useExisting: MongooseMaintenanceRepository },
  ],
})
export class MaintenanceModule {}