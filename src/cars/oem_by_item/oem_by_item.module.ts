import { Module } from '@nestjs/common';
import { OemByItemService } from './oem_by_item.service';
import { OemByItemController } from './oem_by_item.controller';
import { ParserModule } from 'src/parser/parser.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports:[
    ParserModule,
    PrismaModule
  ],
  controllers: [OemByItemController],
  providers: [OemByItemService],
})
export class OemByItemModule {}
