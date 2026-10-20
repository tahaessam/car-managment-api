import { Module } from '@nestjs/common';
import { FuelService } from './fuel.service.js';
import { FuelController } from './fuel.controller.js';
import { FuelRepository } from './fuel.repository.js';
import { MongooseFuelRepository } from './mongoose-fuel.repository.js';
import { Fuel, FuelSchema } from './schemas/fuel.schema.js';
import { MongooseModule } from '@nestjs/mongoose';
import { CarsModule } from '../cars/cars.module.js';

@Module({
  imports: [
    CarsModule,
    MongooseModule.forFeature([{ name: Fuel.name, schema: FuelSchema }]),
  ],
  controllers: [FuelController],
  providers: [
    FuelService,
    MongooseFuelRepository,
    { provide: FuelRepository, useExisting: MongooseFuelRepository },
  ],
})
export class FuelModule {}
