import { Module } from '@nestjs/common';
import { CarBrandsService } from './car_brands.service';
import { CarBrandsController } from './car_brands.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  controllers: [CarBrandsController],
  providers: [CarBrandsService],
})
export class CarBrandsModule {}
