import { Injectable } from '@nestjs/common';
import { HistoryAction } from 'generated/prisma/enums';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(
    userId: number,
    action: HistoryAction,
    metadata?: any,
  ) {
    return this.prisma.history.create({
      data: {
        userId,
        action,
        metadata,
      },
    });
  }
}