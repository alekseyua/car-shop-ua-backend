import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { IoredisModule } from 'src/core/ioredis/ioredis.module';
import { ParserModule } from 'src/integrations/parser/parser.module';

@Module({
  imports: [PrismaModule, IoredisModule, ParserModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
