import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserServiceKroonOil } from './parser.kroonoil.service';

@Module({
  imports: [],
  providers: [ParserService, ParserServiceKroonOil],
  exports: [ParserService, ParserServiceKroonOil],
})
export class ParserModule {}
