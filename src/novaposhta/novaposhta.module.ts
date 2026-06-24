import { Module } from '@nestjs/common';
import { NovaposhtaService } from './novaposhta.service';
import { NovaposhtaController } from './novaposhta.controller';
import { IoredisModule } from 'src/core/ioredis/ioredis.module';
import { IoredisService } from 'src/core/ioredis/ioredis.service';

@Module({
  imports: [IoredisModule],
  controllers: [NovaposhtaController],
  providers: [NovaposhtaService, IoredisService],
})
export class NovaposhtaModule {}
