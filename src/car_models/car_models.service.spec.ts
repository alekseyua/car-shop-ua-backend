import { Test, TestingModule } from '@nestjs/testing';
import { CarModelsService } from './car_models.service';

describe('CarModelsService', () => {
  let service: CarModelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarModelsService],
    }).compile();

    service = module.get<CarModelsService>(CarModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
