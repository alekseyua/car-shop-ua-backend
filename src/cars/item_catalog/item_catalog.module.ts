import { Module } from '@nestjs/common';
import { ItemCatalogService } from './item_catalog.service';
import { ItemsCatalogController } from './item_catalog.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ParserModule } from 'src/parser/parser.module';

@Module({
  imports:[
    PrismaModule,
    ParserModule
  ],
  controllers: [ItemsCatalogController],
  providers: [ItemCatalogService],
})
export class ItemsCatalogModule {}
