import { Test, TestingModule } from '@nestjs/testing';
import { CarModificationService } from './car_modification.service';

describe('CarModificationService', () => {
  let service: CarModificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarModificationService],
    }).compile();

    service = module.get<CarModificationService>(CarModificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
