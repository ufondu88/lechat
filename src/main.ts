import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

require('dotenv').config();

async function bootstrap() {
  const logger = new Logger('Main')
  const app = await NestFactory.create(AppModule);

  // app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  })  

  const PORT = process.env.PORT

  logger.log(`Listening on port ${PORT}`)

  await app.listen(PORT || 3000);
}
bootstrap();
