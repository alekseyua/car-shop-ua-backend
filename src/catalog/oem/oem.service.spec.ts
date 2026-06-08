import { Test, TestingModule } from '@nestjs/testing';
import { OemService } from './oem.service';

describe('OemService', () => {
  let service: OemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OemService],
    }).compile();

    service = module.get<OemService>(OemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
