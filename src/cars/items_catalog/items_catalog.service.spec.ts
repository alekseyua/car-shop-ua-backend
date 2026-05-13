import { Test, TestingModule } from '@nestjs/testing';
import { ItemsCatalogService } from './items_catalog.service';

describe('ItemsCatalogService', () => {
  let service: ItemsCatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemsCatalogService],
    }).compile();

    service = module.get<ItemsCatalogService>(ItemsCatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
