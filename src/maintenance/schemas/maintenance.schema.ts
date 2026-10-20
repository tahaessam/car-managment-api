import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MaintenanceDocument = HydratedDocument<Maintenance>;

@Schema({ timestamps: true })
export class Maintenance {
  @Prop({
    type: Types.ObjectId,
    ref: 'Car',
    required: true,
  })
  carId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, min: 0 })
  odometer: number;

  @Prop({ required: true, min: 0, default: 0 })
  laborCost: number;

  @Prop({ required: true, min: 0, default: 0 })
  partsCost: number;

  @Prop({ trim: true, default: '' })
  notes: string;
}

export const MaintenanceSchema =
  SchemaFactory.createForClass(Maintenance);