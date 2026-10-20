import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

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

  @Prop({
    type: Types.ObjectId, //Types.ObjectId: ده نوع القيمة اللي هنخزنها للإشارة إلى المستخدم داخل MongoDB.
    ref: 'User', //ref: 'User': بيحدد إن المرجع مرتبط بموديل المستخدم User، وده بيسمح باستخدام populate() عند الحاجة.
    required: true, //required: true: يمنع إنشاء عربية جديدة من غير مالك، لما يتم تطبيق الـ Schema validation.
  })
  owner: Types.ObjectId;
}

export const CarSchema = SchemaFactory.createForClass(Car);
