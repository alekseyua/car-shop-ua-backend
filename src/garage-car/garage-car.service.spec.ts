import { Test, TestingModule } from '@nestjs/testing';
import { GarageCarService } from './garage-car.service';

describe('GarageCarService', () => {
  let service: GarageCarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GarageCarService],
    }).compile();

    service = module.get<GarageCarService>(GarageCarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
