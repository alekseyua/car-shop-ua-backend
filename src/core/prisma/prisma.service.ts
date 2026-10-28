import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  // async onModuleInit() {
  //   await this.$connect();
  // }
  async onModuleInit() {
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();

        this.logger.log('Database connected successfully');
        return;
      } catch (error) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxAttempts} failed`,
        );

        if (attempt === maxAttempts) {
          throw error;
        }

        const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
