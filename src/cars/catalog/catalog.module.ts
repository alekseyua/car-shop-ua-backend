import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { ParserModule } from 'src/parser/parser.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [ParserModule, PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
