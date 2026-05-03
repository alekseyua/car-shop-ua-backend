import { Test, TestingModule } from '@nestjs/testing';
import { CarBrandsService } from './car_brands.service';

describe('CarBrandsService', () => {
  let service: CarBrandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarBrandsService],
    }).compile();

    service = module.get<CarBrandsService>(CarBrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
