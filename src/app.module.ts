import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarModelsModule } from './car_models/car_models.module';
import { ConfigModule } from '@nestjs/config';
import { CarBrandsModule } from './car_brands/car_brands.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CarModelsModule,
    CarBrandsModule,
    PrismaModule, 
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
