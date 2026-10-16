import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CarDocument = HydratedDocument<Car>;

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true, trim: true })
  brand: string;

  @Prop({ required: true, trim: true })
  model: string;

  @Prop({ required: true, min: 1886, max: 2100 })
  year: number;
  @Prop({ required: true, trim: true })
  PlateNum: string;

}

export const CarSchema = SchemaFactory.createForClass(Car);
/**
 * -----------------------------------------------------------------
 * 1. SchemaFactory.createForClass(Car)
 * -----------------------------------------------------------------
 * هي الجسر اللي بتحول كلاس الـ TypeScript إلى Mongoose Schema حقيقية 
 * تفهمها قاعدة بيانات MongoDB وMongoose.
 */

/**
 * -----------------------------------------------------------------
 * 2. export type CarDocument = HydratedDocument<Car>
 * -----------------------------------------------------------------
 * بتدمج كلاس الـ Car مع خصائص ووظائف Mongoose Document (زي .save وغيره)،
 * وده بيخلي TypeScript يديك Auto-complete ودقة كاملة في الأنواع وأنت شغال.
 */