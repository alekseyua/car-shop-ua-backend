import { Test, TestingModule } from '@nestjs/testing';
import { GarageCarController } from './garage-car.controller';
import { GarageCarService } from './garage-car.service';

describe('GarageCarController', () => {
  let controller: GarageCarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GarageCarController],
      providers: [GarageCarService],
    }).compile();

    controller = module.get<GarageCarController>(GarageCarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
