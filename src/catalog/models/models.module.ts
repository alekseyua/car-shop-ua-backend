import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [
      PrismaModule
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
})
export class CarModelsModule {}
