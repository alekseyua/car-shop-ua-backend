import { Module } from '@nestjs/common';
import { AccessoriesController } from './accessories.controller';
import { ParserModule } from 'src/integrations/parser/parser.module';
import { IoredisModule } from 'src/core/ioredis/ioredis.module';
import { AccessoriesService } from './accessories.service';

@Module({
  imports: [ParserModule, IoredisModule],
  controllers: [AccessoriesController],
  providers: [AccessoriesService],
})
export class AccessoriesModule {}
