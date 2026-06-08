import { Test, TestingModule } from '@nestjs/testing';
import { ModificationService } from './modification.service';

describe('ModificationService', () => {
  let service: ModificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModificationService],
    }).compile();

    service = module.get<ModificationService>(ModificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
