import { Test, TestingModule } from '@nestjs/testing';
import { NovaposhtaController } from './novaposhta.controller';
import { NovaposhtaService } from './novaposhta.service';

describe('NovaposhtaController', () => {
  let controller: NovaposhtaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NovaposhtaController],
      providers: [NovaposhtaService],
    }).compile();

    controller = module.get<NovaposhtaController>(NovaposhtaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
