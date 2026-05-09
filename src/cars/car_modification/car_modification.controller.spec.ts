import { Test, TestingModule } from '@nestjs/testing';
import { CarModificationController } from './car_modification.controller';
import { CarModificationService } from './car_modification.service';

describe('CarModificationController', () => {
  let controller: CarModificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarModificationController],
      providers: [CarModificationService],
    }).compile();

    controller = module.get<CarModificationController>(CarModificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
