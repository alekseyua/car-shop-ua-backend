import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductController } from './products.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ParserModule } from 'src/integrations/parser/parser.module';
import { IoredisModule } from 'src/core/ioredis/ioredis.module';

@Module({
  imports:[
    PrismaModule,
    ParserModule,
    IoredisModule
  ],
  controllers: [ProductController],
  providers: [ProductsService],
})
export class ProductModule {}
