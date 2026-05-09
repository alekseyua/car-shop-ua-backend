import { Test, TestingModule } from '@nestjs/testing';
import { CarBrandsController } from './car_brands.controller';
import { CarBrandsService } from './car_brands.service';

describe('CarBrandsController', () => {
  let controller: CarBrandsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarBrandsController],
      providers: [CarBrandsService],
    }).compile();

    controller = module.get<CarBrandsController>(CarBrandsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
