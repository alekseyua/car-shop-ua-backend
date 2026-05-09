import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarModelsModule } from './car_models/car_models.module';
import { ConfigModule } from '@nestjs/config';
import { CarBrandsModule } from './car_brands/car_brands.module';
import { PrismaModule } from './prisma/prisma.module';
import paginationConfig from './config/pagination.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        paginationConfig
      ]
    }),
    CarModelsModule,
    CarBrandsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],

})
export class AppModule { }
