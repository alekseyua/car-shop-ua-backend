import { Module } from '@nestjs/common';
import { GarageCarService } from './garage-car.service';
import { GarageCarController } from './garage-car.controller';

@Module({
  controllers: [GarageCarController],
  providers: [GarageCarService],
})
export class GarageCarModule {}
