import { Test, TestingModule } from '@nestjs/testing';
import { IoredisService } from './ioredis.service';

describe('IoredisService', () => {
  let service: IoredisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IoredisService],
    }).compile();

    service = module.get<IoredisService>(IoredisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
