import { Module } from '@nestjs/common';
import { OemService } from './oem.service';
import { OemController } from './oem.controller';
import { ParserModule } from 'src/integrations/parser/parser.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports:[
    ParserModule,
    PrismaModule
  ],
  controllers: [OemController],
  providers: [OemService],
})
export class OemByItemModule {}
