import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined;
  const port = process.env.PORT || 3000;

  // You must listen on all IPV4 addresses in Cloud Run
  const host = IS_GOOGLE_CLOUD_RUN ? '0.0.0.0' : undefined;

  await app.listen(port, host);
}
bootstrap();
