import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function bootstrap() {
  const certDir = path.join(process.env.HOME!, 'localhost-certs');
  // const httpsOptions = {
  //   key: fs.readFileSync(path.join(certDir, 'dev-key.pem')),
  //   cert: fs.readFileSync(path.join(certDir, 'dev.pem')),
  // };
  const app = await NestFactory.create(AppModule, {
    // httpsOptions,
  });
  app.enableCors({
    origin: [
      'https://test-front:3000',
      'https://autopro.pp.ua',
      'https://www.autopro.pp.ua',
      'http://autopro.pp.ua',
    ],
    credentials: true,
  });
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.setGlobalPrefix('api');

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
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0', () =>
    console.log('server start on port ' + port),
  );
}
bootstrap();
