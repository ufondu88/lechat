import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

require('dotenv').config();

async function bootstrap() {
  const logger = new Logger('Main')
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('LeChat')
    .setDescription('The LeChat API description')
    .setVersion('1.0')
    .addTag('lechat')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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
