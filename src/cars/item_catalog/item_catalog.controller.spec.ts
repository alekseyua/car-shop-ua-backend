import { Test, TestingModule } from '@nestjs/testing';
import { ItemsCatalogController } from './item_catalog.controller';
import { ItemCatalogService } from './item_catalog.service';

describe('ItemsCatalogController', () => {
  let controller: ItemsCatalogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsCatalogController],
      providers: [ItemCatalogService],
    }).compile();

    controller = module.get<ItemsCatalogController>(ItemsCatalogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
