import { Module } from '@nestjs/common';
import { NovaposhtaService } from './novaposhta.service';
import { NovaposhtaController } from './novaposhta.controller';

@Module({
  controllers: [NovaposhtaController],
  providers: [NovaposhtaService],
})
export class NovaposhtaModule {}
