import { Module } from '@nestjs/common';
import { CarModificationService } from './car_modification.service';
import { CarModificationController } from './car_modification.controller';

@Module({
  controllers: [CarModificationController],
  providers: [CarModificationService],
})
export class CarModificationModule {}
