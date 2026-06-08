import { Module } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CatalogController } from './categories.controller';
import { ParserModule } from 'src/integrations/parser/parser.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [ParserModule, PrismaModule],
  controllers: [CatalogController],
  providers: [CategoryService],
})
export class CatalogModule {}
