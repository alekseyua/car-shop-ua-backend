import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const AppModuleParams = isProduction
    ? {}
    : {
        httpsOptions: {
          key: fs.readFileSync(
            path.join(process.env.HOME!, 'localhost-certs/dev-key.pem'),
          ),
          cert: fs.readFileSync(
            path.join(process.env.HOME!, 'localhost-certs/dev.pem'),
          ),
        },
      };
  const corsOriginUrl = isProduction
    ? [
        'https://autopro.pp.ua',
        'https://www.autopro.pp.ua',
        'http://autopro.pp.ua',
      ]
    : ['http://localhost:3000', 'https://front.com:3000'];
  const app = await NestFactory.create(AppModule, AppModuleParams);
  app.enableCors({
    origin: corsOriginUrl,
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
