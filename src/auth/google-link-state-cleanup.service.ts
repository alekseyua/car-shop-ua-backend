import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class GoogleLinkStateCleanupService {
  private readonly logger = new Logger(GoogleLinkStateCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredStates(): Promise<void> {
    try {
      await this.prisma.googleLinkState.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      this.logger.error(
        'Failed to clean up expired Google link states',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
