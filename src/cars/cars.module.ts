import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarsController } from './cars.controller.js';
import { CarsService } from './cars.service.js';
import { Car, CarSchema } from './schemas/car.schema.js';
/*/**
 * -----------------------------------------------------------------
 * 3. MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])
 * -----------------------------------------------------------------
 * بتتسجل جوه الـ imports في الـ Module عشان تعرف NestJS و Mongoose
 * إن الموديول ده هيتعامل مع الموديل ده، وتقدر تعمل إنجكت (Inject) 
 * للـ Model جوه الـ Services بتاعتك.
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])],
  controllers: [CarsController],
  providers: [CarsService],
})
export class CarsModule {}
