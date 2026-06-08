import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
