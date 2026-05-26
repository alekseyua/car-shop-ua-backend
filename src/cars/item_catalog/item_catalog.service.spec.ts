import { Test, TestingModule } from '@nestjs/testing';
import { ItemCatalogService } from './item_catalog.service';

describe('ItemCatalogService', () => {
  let service: ItemCatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemCatalogService],
    }).compile();

    service = module.get<ItemCatalogService>(ItemCatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
