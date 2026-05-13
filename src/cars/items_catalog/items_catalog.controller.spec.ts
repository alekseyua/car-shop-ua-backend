import { Test, TestingModule } from '@nestjs/testing';
import { ItemsCatalogController } from './items_catalog.controller';
import { ItemsCatalogService } from './items_catalog.service';

describe('ItemsCatalogController', () => {
  let controller: ItemsCatalogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsCatalogController],
      providers: [ItemsCatalogService],
    }).compile();

    controller = module.get<ItemsCatalogController>(ItemsCatalogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
