import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import { CarModelsModule } from './cars/car_models/car_models.module';
import { CarBrandsModule } from './cars/car_brands/car_brands.module';
import { CoreModule } from './core/core.module';
import { CarModificationModule } from './cars/car_modification/car_modification.module';

@Module({
  imports: [
    CoreModule,
    CarModelsModule,
    CarBrandsModule,
    CarModificationModule,
  ],
  controllers: [],
  providers: [],

})
export class AppModule { }
