import { Module } from '@nestjs/common';
import { ModificationService } from './modification.service';
import { ModificationController } from './modification.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ParserModule } from 'src/integrations/parser/parser.module';

@Module({
  imports: [PrismaModule, ParserModule],
  controllers: [ModificationController],
  providers: [ModificationService],
})
export class CarModificationModule {}
