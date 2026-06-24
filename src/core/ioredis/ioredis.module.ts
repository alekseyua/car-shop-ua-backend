import { Module } from '@nestjs/common';
import { IoredisService } from './ioredis.service';

@Module({
    providers: [IoredisService],
    exports: [IoredisService]
})
export class IoredisModule {}
