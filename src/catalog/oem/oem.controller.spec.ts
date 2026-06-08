import { Test, TestingModule } from '@nestjs/testing';
import { OemController } from './oem.controller';
import { OemService } from './oem.service';

describe('OemController', () => {
  let controller: OemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OemController],
      providers: [OemService],
    }).compile();

    controller = module.get<OemController>(OemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
