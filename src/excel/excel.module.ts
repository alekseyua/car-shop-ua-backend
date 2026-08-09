import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { ParserModule } from 'src/integrations/parser/parser.module';
import { IoredisModule } from 'src/core/ioredis/ioredis.module';

@Module({
  imports: [ParserModule, IoredisModule],
  controllers: [ExcelController],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule { }