import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FuelDocument = HydratedDocument<Fuel>;

@Schema({ timestamps: true })
export class Fuel {
  @Prop({ required: true })
  isFullTank: boolean;

  @Prop({ required: true, min: 0 })
  fuelAmount: number;

  @Prop({ required: true, min: 0 })
  totalCost: number;

  @Prop({ required: true, min: 0 })
  fuelPriceAmount: number;

  @Prop({ required: true, min: 0 })
  odometerReading: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Car',
    required: true,
  })
  carId: Types.ObjectId;
}

export const FuelSchema = SchemaFactory.createForClass(Fuel);