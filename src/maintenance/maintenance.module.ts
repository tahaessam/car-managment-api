import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MaintenanceService } from './maintenance.service.js';
import { MaintenanceController } from './maintenance.controller.js';

import {
  Maintenance,
  MaintenanceSchema,
} from './schemas/maintenance.schema.js';

import { Car, CarSchema } from '../cars/schemas/car.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Maintenance.name, schema: MaintenanceSchema },
      { name: Car.name, schema: CarSchema },
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}