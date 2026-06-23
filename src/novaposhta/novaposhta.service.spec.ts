import { Test, TestingModule } from '@nestjs/testing';
import { NovaposhtaService } from './novaposhta.service';

describe('NovaposhtaService', () => {
  let service: NovaposhtaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NovaposhtaService],
    }).compile();

    service = module.get<NovaposhtaService>(NovaposhtaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
