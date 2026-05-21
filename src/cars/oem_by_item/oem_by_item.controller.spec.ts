import { Test, TestingModule } from '@nestjs/testing';
import { OemByItemController } from './oem_by_item.controller';
import { OemByItemService } from './oem_by_item.service';

describe('OemByItemController', () => {
  let controller: OemByItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OemByItemController],
      providers: [OemByItemService],
    }).compile();

    controller = module.get<OemByItemController>(OemByItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
