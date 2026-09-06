import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Car Shop API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('cars')
    .addBearerAuth
    // {
    //   type: 'http',
    //   scheme: 'bearer',
    //   bearerFormat: 'JWT',
    // },
    // 'access-token',
    ()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
