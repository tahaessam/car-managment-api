import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /*- whitelist: true بيزيل الحقول اللي مش عليها قواعد تحقق من الـ DTO.
- transform: true بيسمح بتحويل البيانات الواردة إلى أنواع DTO المناسبة عند الحاجة، لكنه لا يضمن وحده تحويل كل قيمة إلى نوعها الصحيح.
- ValidationPipe بيشغّل قواعد class-validator قبل وصول البيانات إلى منطق الـ Controller.
وده مهم أمنيًا؛ لأن TypeScript types وحدها مش بتتحقق من بيانات HTTP وقت التشغيل.
  */
 
app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
