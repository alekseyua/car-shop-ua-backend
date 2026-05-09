import { Test, TestingModule } from '@nestjs/testing';
import { CarModelsController } from './car_models.controller';
import { CarModelsService } from './car_models.service';

describe('CarModelsController', () => {
  let controller: CarModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarModelsController],
      providers: [CarModelsService],
    }).compile();

    controller = module.get<CarModelsController>(CarModelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
