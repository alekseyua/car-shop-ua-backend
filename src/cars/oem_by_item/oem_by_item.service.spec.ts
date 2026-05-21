import { Test, TestingModule } from '@nestjs/testing';
import { OemByItemService } from './oem_by_item.service';

describe('OemByItemService', () => {
  let service: OemByItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OemByItemService],
    }).compile();

    service = module.get<OemByItemService>(OemByItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
