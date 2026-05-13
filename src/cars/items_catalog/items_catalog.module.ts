import { Module } from '@nestjs/common';
import { ItemsCatalogService } from './items_catalog.service';
import { ItemsCatalogController } from './items_catalog.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ParserModule } from 'src/parser/parser.module';

@Module({
  imports:[
    PrismaModule,
    ParserModule
  ],
  controllers: [ItemsCatalogController],
  providers: [ItemsCatalogService],
})
export class ItemsCatalogModule {}
