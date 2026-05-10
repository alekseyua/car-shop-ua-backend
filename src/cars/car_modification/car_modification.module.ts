import { Module } from '@nestjs/common';
import { CarModificationService } from './car_modification.service';
import { CarModificationController } from './car_modification.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ParserModule } from 'src/parser/parser.module';

@Module({
  imports: [PrismaModule, ParserModule],
  controllers: [CarModificationController],
  providers: [CarModificationService],
})
export class CarModificationModule {}
