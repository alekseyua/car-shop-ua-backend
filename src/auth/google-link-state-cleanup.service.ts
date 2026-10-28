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
      const result = await this.prisma.googleLinkState.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Deleted ${result.count} expired Google link states`);
      }
    } catch (error) {
      this.logger.error(
        'Failed to clean up expired Google link states',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
